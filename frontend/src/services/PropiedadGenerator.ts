// services/PropiedadGenerator.ts
import type { Propiedad, PropiedadDTO } from '../models/Propiedad';
import { PropiedadService } from './PropiedadService';

interface PropertyConfig {
    direccion: string;
    numPisos: number;
    pisosPorBloque: number;
    tieneLocales: boolean;
    localesPorPlanta: number;
    tieneParking: boolean;
    plazasParking: number;
    comunidadId: string;
}

export const PropiedadGenerator = {
    async generateForCommunity(config: PropertyConfig): Promise<Propiedad[]> {
        const properties: Propiedad[] = [];
        const { direccion, comunidadId } = config;

        try {
            // Generate apartments
            for (let piso = 1; piso <= config.numPisos; piso++) {
                for (let puerta = 1; puerta <= config.pisosPorBloque; puerta++) {
                    const propiedad: PropiedadDTO = {
                        referencia: `PISO-${piso}-${String.fromCharCode(64 + puerta)}`,
                        direccion,
                        piso: piso.toString(),
                        puerta: String.fromCharCode(64 + puerta),
                        tipo: 'piso',
                        estado: 'disponible',
                        comunidad: comunidadId,
                        propietario: '000000000000000000000000', // Default empty owner ID
                        numHabitaciones: 3,  // Default values
                        numBanos: 1,
                        codigoPostal: '',    // Added required fields
                        ciudad: '',
                        provincia: '',
                        pais: 'España'
                    };
                    console.log('Creating property:', propiedad);
                    const created = await PropiedadService.create(propiedad);
                    properties.push(created);
                }
            }

            // Generate commercial spaces if enabled
            if (config.tieneLocales && config.localesPorPlanta > 0) {
                for (let local = 1; local <= config.localesPorPlanta; local++) {
                    const propiedad: PropiedadDTO = {
                        referencia: `LOCAL-0-${local}`, // Usamos planta 0 para locales
                        direccion,
                        piso: '0', // Planta baja
                        puerta: `L${local}`,
                        tipo: 'local',
                        estado: 'disponible',
                        comunidad: comunidadId,
                        propietario: '000000000000000000000000',
                        numHabitaciones: 0,
                        numBanos: 0,
                        codigoPostal: '',
                        ciudad: '',
                        provincia: '',
                        pais: 'España'
                    };
                        console.log('Creating commercial space:', propiedad);
                        const created = await PropiedadService.create(propiedad);
                        properties.push(created);
                    }
                }

            // Generate parking spaces if enabled
            if (config.tieneParking && config.plazasParking > 0) {
                for (let plaza = 1; plaza <= config.plazasParking; plaza++) {
                    const propiedad: PropiedadDTO = {
                        referencia: `PARK-${plaza.toString().padStart(3, '0')}`,
                        direccion,
                        tipo: 'garaje',
                        estado: 'disponible',
                        comunidad: comunidadId,
                        propietario: '000000000000000000000000',
                        numHabitaciones: 0,
                        numBanos: 0,
                        codigoPostal: '',
                        ciudad: '',
                        provincia: '',
                        pais: 'España'
                    };
                    console.log('Creating parking space:', propiedad);
                    const created = await PropiedadService.create(propiedad);
                    properties.push(created);
                }
            }

            return properties;
        } catch (error) {
            console.error('Error generating properties:', error);
            throw new Error('Error al generar las propiedades: ' + (error as Error).message);
        }
    }
};