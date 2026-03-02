import Task from "../models/Task.js";
import {v2 as cloudinary} from 'cloudinary';


const allowed =["Pendiente", "En progreso", "Completada"];


export async function list(req, res) {

  // detectar que el usuario vio sus tareas
  await Task.updateMany(
    { user: req.userId, deleted: false, status: "Pendiente" },
    { 
      $inc: { viewCount: 1 },
      $set: { lastInteracted: new Date() }
    }
  );

    const items = await Task.find({user: req.userId, deleted: false}).sort({createdAt: -1});
    res.json(items);
}

export async function create(req, res) {
  const {title, description = "", image = "", imagePublicId = "", status = "Pendiente", clienteId} = req.body;
  if(!title) return res.status(400).json({message: 'El título es obligatorio'});
  
  const task = await Task.create({
    user: req.userId,
    title,
    description,
    image,
    imagePublicId,
    status: allowed.includes(status) ? status : 'Pendiente',
    clienteId
  });
  return res.status(201).json({ task });

}


export async function update(req, res) {
  const { id } = req.params;
  const { title, description, image, imagePublicId, status, completed } = req.body;

  if (status && !allowed.includes(status))
    return res.status(400).json({ message: "Estado inválido" });

  const task = await Task.findOne({ _id: id, user: req.userId });
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

  //Traducir checkbox a estado
  let newStatus = status;

  if (typeof completed === "boolean") {
    newStatus = completed ? "Completada" : "Pendiente";
  }

  if (newStatus && !allowed.includes(newStatus))
    return res.status(400).json({ message: "Estado inválido" });

  // detectar edición
  if (title && title !== task.title) {
    task.editCount += 1;
  }

  // detectar que interactuó
  task.lastInteracted = new Date();

  //Cambio de imagen 
  if (image && image !== task.image) {

  if (task.imagePublicId) {
    await cloudinary.uploader.destroy(task.imagePublicId);
  }

  task.image = image;
  task.imagePublicId = imagePublicId;
}

  // aplicar cambios
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (newStatus !== undefined) task.status = newStatus;

  await task.save();

  res.json({ task });
}

export async function remove(req, res) {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, user: req.userId });
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

  if (task.imagePublicId) {
    await cloudinary.uploader.destroy(task.imagePublicId);
  }

  task.deleted = true;
  await task.save();

  res.json({ ok: true });
}

/** ENDPOINT PARA SINCRONIZACIÓN OFFLINE: crea/actualiza por clienteId y devuelve el mapeo */
export async function bulksync(req, res) {
  try {
    const { tasks = [] } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks debe ser array" });
    }

    // Normaliza y filtra válidos
    const clean = tasks
      .filter(t => t && t.clienteId && t.title)
      .map(t => ({
        clienteId: String(t.clienteId),
        title: String(t.title),
        description: t.description ?? "",
        image: t.image ?? "",
        imagePublicId: t.imagePublicId ?? "",
        status: allowed.includes(t.status) ? t.status : "Pendiente",
      }));

    if (!clean.length) return res.json({ mapping: [] });

    // 1) bulkWrite con UPSERT por (user, clienteId)
    const ops = clean.map(t => ({
      updateOne: {
        filter: { user: req.userId, clienteId: t.clienteId },
        update: {
          $set: {
            title: t.title,
            description: t.description,
            image: t.image,
            imagePublicId: t.imagePublicId,
            status: t.status,
          },
          $setOnInsert: {
            user: req.userId,
            clienteId: t.clienteId,
          }
        },
        upsert: true,
      }
    }));

    await Task.bulkWrite(ops, { ordered: false }); // no importa el orden, continúa si una falla

    // 2) devolver mapping clienteId -> serverId
    const clienteIds = clean.map(t => t.clienteId);
    const docs = await Task.find({ user: req.userId, clienteId: { $in: clienteIds } })
                           .select("_id clienteId");

    const mapping = docs.map(d => ({ clienteId: d.clienteId, serverId: String(d._id) }));
    return res.json({ mapping });
  } catch (err) {
    console.error("bulksync error:", err);
    return res.status(500).json({ message: "Error en bulksync" });
  }
}

export async function alerts(req, res) {

  const tasks = await Task.find({
    user: req.userId,
    deleted: false,
    status: "Pendiente"
  });

  const alerts = [];

  tasks.forEach(t => {

    // la ve muchas veces pero no la hace
    if (t.viewCount >= 5) {
      alerts.push(`👀 Has visto muchas veces "${t.title}" pero no la completas`);
    }

    // la cambia mucho
    if (t.editCount >= 4) {
      alerts.push(`🤔 Parece que no sabes cómo empezar "${t.title}"`);
    }

    // lleva días sin tocarla
    const dias = (Date.now() - t.createdAt) / (1000*60*60*24);
    if (dias >= 3) {
      alerts.push(`⏰ Llevas varios días evitando "${t.title}"`);
    }

  });

  res.json(alerts);
}
