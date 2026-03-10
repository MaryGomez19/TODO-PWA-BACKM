import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        image: { 
            type: String,
            default: "https://res.cloudinary.com/dfrnbcqs0/image/upload/v1772069424/defecto_bmectw.gif",
        },
        imagePublicId: { type: String, trim: true, default: '' },
        status:{
            type: String,
            enum: ['Pendiente', 'En progreso', 'Completada'],
            default: 'Pendiente',
        },
        clienteId: { type: String},
        deleted: {type: Boolean, default: false},
        editCount: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        lastInteracted: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
    }
);

taskSchema.index(
    { user: 1, clienteId: 1 },
    {
        unique: true,
        partialFilterExpression: { 
            clienteId: { $exists: true, $ne: null, $ne: ''}, 
            deleted:{$ne: true},
        },
        name: 'uniq_user_clienteId',
        background: true
    });

export default mongoose.model("Task", taskSchema);