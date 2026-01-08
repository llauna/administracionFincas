import { Router } from 'express';
import Propiedad from '../models/Propiedad';

const router = Router();

// Obtener todas las propiedades
router.get('/', async (req, res) => {
    try {
        const propiedades = await Propiedad.find().populate('comunidad', 'nombre');
        res.json(propiedades);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener propiedades' });
    }
});

// Crear una nueva propiedad
router.post('/', async (req, res) => {
    try {
        const nueva = new Propiedad(req.body);
        await nueva.save();
        res.status(201).json(nueva);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la propiedad' });
    }
});

// Eliminar propiedad
router.delete('/:id', async (req, res) => {
    try {
        await Propiedad.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
    try {
        const propiedad = await Propiedad.findById(req.params.id);
        if (!propiedad) return res.status(404).json({ message: 'No encontrada' });
        res.json(propiedad);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Actualizar
router.put('/:id', async (req, res) => {
    try {
        const actualizada = await Propiedad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar' });
    }
});

// Obtener propiedades por comunidad (Añadir esta ruta antes de la de:id)
router.get('/comunidad/:comunidadId', async (req, res) => {
    try {
        const propiedades = await Propiedad.find({ comunidad: req.params.comunidadId })
            .populate('propietario', 'nombre name');
        res.json(propiedades);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las propiedades de la comunidad' });
    }
});

export default router;