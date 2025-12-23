import { Router } from 'express';
import Comunidad from '../models/Comunidad';

const router = Router();

// GET all
router.get('/', async (req, res) => {
    try {
        const comunidades = await Comunidad.find();
        res.json(comunidades);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comunidades' });
    }
});

// POST new
router.post('/', async (req, res) => {
    try {
        const { nombre, direccion } = req.body;
        const nueva = new Comunidad({ nombre, direccion });
        await nueva.save();
        res.status(201).json(nueva);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error al crear la comunidad' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await Comunidad.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
});

// PUT (Update)
router.put('/:id', async (req, res) => {
    try {
        const actualizada = await Comunidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar' });
    }
});

// GET by ID
router.get('/:id', async (req, res) => {
    try {
        const comunidad = await Comunidad.findById(req.params.id);
        if (!comunidad) return res.status(404).json({ message: 'No encontrada' });
        res.json(comunidad);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// GET
router.get('/', async (req, res) => {
    try {
        const comunidades = await Comunidad.find();
        res.json(comunidades);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comunidades' });
    }
});

export default router;