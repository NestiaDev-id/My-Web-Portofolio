import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("portofolio");
  const collection = db.collection("blog");

  if (req.method === "GET") {
    const blogs = await collection.find({}).toArray();
    return res.status(200).json(blogs);
  }

  if (req.method === "POST") {
    const { title, content } = req.body;
    const result = await collection.insertOne({
      title,
      content,
      createdAt: new Date(),
    });
    return res.status(201).json(result);
  }

  res.status(405).end("Method Not Allowed");
}
