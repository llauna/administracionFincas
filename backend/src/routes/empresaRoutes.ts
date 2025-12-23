import { Router } from 'express';
import Empresa from '../models/Empresa';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const empresas = await Empresa.find();
        res.json(empresas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener empresas' });
    }
});

// Este POST responde a /api/empresas
router.post('/', async (req, res) => {
    try {
        const nuevaEmpresa = new Empresa(req.body);
        await nuevaEmpresa.save();
        res.status(201).json(nuevaEmpresa);
    } catch (error) {
        res.status(400).json({ message: 'Error' });
    }
});

export default router;