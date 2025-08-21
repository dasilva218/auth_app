"use server"
import { SignupFormSchema } from "@/lib/definitions";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
type UserType = {
  id: number;
  name: string;
  email: string
  password: string
}

export async function signup(formData: FormData) {
  // validation des champs
  const validerChamp = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validerChamp.success) {
    throw new Error(`Validation echouée: ${validerChamp.error.message}`);
  }

  const { email, name, password } = validerChamp.data;

  const bdPath = path.join(process.cwd(), 'src/bd/data.json')

  let Users: Array<UserType> = [];

  try {
    const data = await fs.readFile(bdPath, 'utf8');
    Users = JSON.parse(data);
  } catch (error) {
    // Fichier n'existe pas, créer un tableau vide
    await fs.mkdir(path.dirname(bdPath), { recursive: true });
  }
  // vérifier si l'utilisateur existe déjà
  const utilisateurExistant = Users.find(user => user.email === email);
  if (utilisateurExistant) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  const Salt = bcrypt.genSaltSync(10)
  const passwordHash = bcrypt.hashSync(password, Salt)
  // creer un nouvel utilisateur
  const nouvelUtilisateur = {
    id: Users.length + 1,
    name: name,
    email: email,
    password: passwordHash
  }
  // ajouter l'utilisateur à la base de données
  Users.push(nouvelUtilisateur);
  // ajouter dans le fichier DataTransfer.json
  await fs.writeFile(bdPath, JSON.stringify(Users, null, 2))
  return {success: true, message: "Inscription réussie"};
}