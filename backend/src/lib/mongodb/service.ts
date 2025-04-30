import { ObjectId } from "mongodb";
import clientPromise from "./init";
import User from "@/models/user.model";

const dbName = process.env.MONGODB_DB_NAME;

export async function getData(collectionName: string, query = {}) {
  const client = await clientPromise;
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const data = await collection.find(query).toArray();
  return data;
}

export async function addData(
  collectionName: string,
  data: { name: string; email: string; [key: string]: any },
  callback: (response: { status: boolean; message: string }) => void
) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Cek apakah data sudah ada berdasarkan username
    const existingUser = await collection.findOne({ name: data.name });
    const existingUserEmail = await collection.findOne({ email: data.email });
    if (existingUser || existingUserEmail) {
      callback({ status: false, message: "Username or email already exists" });
      return;
    }

    const result = await collection.insertOne(data);
    if (result.acknowledged) {
      callback({ status: true, message: "Data added successfully" });
      return result;
    } else {
      callback({ status: false, message: "Failed to add data" });
    }
  } catch (error) {
    console.error("Error adding data:", error);
    callback({ status: false, message: "Failed to add data" });
  }
}
export async function editData(
  collectionName: string,
  filter: { _id: string },
  updateData: typeof User,
  callback: (response: { status: boolean; message: string }) => void
) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Konversi filter._id ke ObjectId jika berupa string
    const objectId =
      typeof filter._id === "string" ? new ObjectId(filter._id) : filter._id;

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      callback({
        status: false,
        message: "Data tidak ditemukan untuk diupdate.",
      });
    } else if (result.modifiedCount > 0) {
      callback({ status: true, message: "Data berhasil diupdate." });
    } else {
      callback({
        status: true,
        message: "Data ditemukan tapi tidak ada perubahan.",
      });
    }

    return result;
  } catch (error) {
    console.error("Error saat mengupdate data:", error);
    callback({
      status: false,
      message: "Terjadi kesalahan saat mengupdate data.",
    });
  }
}
