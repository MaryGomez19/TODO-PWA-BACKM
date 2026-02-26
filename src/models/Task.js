import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        imageUrl: { type: String, trim: true, default: '' },
        imagePublicId: { type: String, trim: true, default: '' },
        status:{
            type: String,
            enum: ['Pendiente', 'En progreso', 'Completada'],
            default: 'Pendiente',
        },
        clienteId: { type: String},
        deleted: {type: Boolean, default: false},
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
            editCount: { type: Number, default: 0 },
            viewCount: { type: Number, default: 0 },
            lastInteracted: { type: Date, default: Date.now }
        },
        name: 'uniq_user_clienteId',
        background: true
    });

export default mongoose.model("Task", taskSchema);