import React, { type ChangeEvent, type FormEvent } from "react";

interface Propietario {
    _id: string;
    nombre: string;
    apellidos?: string;
}

interface FormData {
    idPropietario: string;
    direccion: string;
    numero: string;
    poblacion: string;
    cp: string;
    planta: string;
    coeficiente: number;
}

type Props = {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent) => void;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    formData: FormData;
    propietarios: Propietario[];
    formError?: string;
};

const PropiedadModal: React.FC<Props> = ({
                                             show,
                                             onClose,
                                             onSubmit,
                                             onChange,
                                             formData,
                                             propietarios,
                                             formError,
                                         }) => {
    if (!show) return null;

    return (
        <div className="modal fade show custom-modal" style={{ display: "block" }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Registrar Nueva Propiedad</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        {formError && <div className="alert alert-danger">{formError}</div>}

                        <form onSubmit={onSubmit} noValidate>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="idPropietario" className="form-label">Propietario</label>
                                    <select
                                        className="form-select"
                                        id="idPropietario"
                                        name="idPropietario"
                                        value={formData.idPropietario}
                                        onChange={onChange}
                                        required
                                    >
                                        <option value="">Seleccione un propietario</option>
                                        {propietarios.map((prop) => (
                                            <option key={prop._id} value={prop._id}>
                                                {prop.nombre} {prop.apellidos || ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="direccion" className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={onChange}
                                        required
                                        placeholder="Calle/Avenida/Plaza..."
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="numero" className="form-label">Número</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="numero"
                                        name="numero"
                                        value={formData.numero}
                                        onChange={onChange}
                                        required
                                        placeholder="Número"
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="poblacion" className="form-label">Población</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="poblacion"
                                        name="poblacion"
                                        value={formData.poblacion}
                                        onChange={onChange}
                                        required
                                        placeholder="Ciudad/Pueblo"
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="cp" className="form-label">Código Postal</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="cp"
                                        name="cp"
                                        value={formData.cp}
                                        onChange={onChange}
                                        required
                                        pattern="[0-9]{5}"
                                        title="El código postal debe tener 5 dígitos"
                                        placeholder="12345"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="planta" className="form-label">Planta</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="planta"
                                        name="planta"
                                        value={formData.planta}
                                        onChange={onChange}
                                        required
                                        placeholder="Ej: 1ºA, Bajo, Ático..."
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="coeficiente" className="form-label">Coeficiente</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="form-control"
                                            id="coeficiente"
                                            name="coeficiente"
                                            value={formData.coeficiente}
                                            onChange={onChange}
                                            required
                                            placeholder="0.00"
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
                                    <div className="form-text">Valor entre 0 y 1 (ej: 0.25 para 25%)</div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Guardar Propiedad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropiedadModal;
