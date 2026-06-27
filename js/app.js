// Mock Database Architecture & In-Memory State
// Transparently handles centralized operations & filters per chosen facility mimicking standard UI
const DB_KEY = 'SALUD_INTEGRAL_MOCK_DB';

const defaultDB = {
    clinicas: [
        { id_clinica: 'C01', nombre: 'Salud Integral Norte', direccion: 'Av. Amazonas N32 y Patria, Quito', telefono: '022555123' },
        { id_clinica: 'C02', nombre: 'Salud Integral Centro', direccion: 'Calle Guayaquil 456 y Espejo, Quito', telefono: '022999456' }
    ],
    medicos: [
        { id_medico: 1, cedula: '1712345678', nombre: 'Dr. Alejandro Mendoza', especialidad: 'Cardiología', horario_atencion: '08:00 - 14:00', id_clinica: 'C01' },
        { id_medico: 2, cedula: '1723456789', nombre: 'Dra. Elena Rostova', especialidad: 'Pediatría', horario_atencion: '10:00 - 16:00', id_clinica: 'C01' },
        { id_medico: 3, cedula: '0912345678', nombre: 'Dr. Carlos Villacís', especialidad: 'Medicina Interna', horario_atencion: '07:00 - 13:00', id_clinica: 'C02' },
        { id_medico: 4, cedula: '0923456789', nombre: 'Dra. Patricia Luna', especialidad: 'Ginecología', horario_atencion: '14:00 - 20:00', id_clinica: 'C02' }
    ],
    telefonos_medico: [
        { id_medico: 1, telefono: '0998765432' },
        { id_medico: 1, telefono: '022444555' },
        { id_medico: 2, telefono: '0987654321' },
        { id_medico: 3, telefono: '099111222' },
        { id_medico: 4, telefono: '098333444' }
    ],
    pacientes: [
        { id_paciente: 1, cedula: '1734567890', nombre: 'Juan Carlos Pérez', edad: 45, direccion: 'Cumbayá, Paseo del Sol 12', telefono: '099000111' },
        { id_paciente: 2, cedula: '1745678901', nombre: 'María Lorena Torres', edad: 29, direccion: 'La Carolina, Edificio Portugal', telefono: '099000222' },
        { id_paciente: 3, cedula: '0934567890', nombre: 'Luis Alfredo Gómez', edad: 62, direccion: 'Centro Histórico, Calle Flores', telefono: '099000333' }
    ],
    consultorios: [
        { id_clinica: 'C01', nro_consultorio: 101, tipo_atencion: 'Consulta General', piso: 1 },
        { id_clinica: 'C01', nro_consultorio: 102, tipo_atencion: 'Especialidades A', piso: 1 },
        { id_clinica: 'C02', nro_consultorio: 201, tipo_atencion: 'Consulta General', piso: 2 },
        { id_clinica: 'C02', nro_consultorio: 202, tipo_atencion: 'Ginecología y Obstetricia', piso: 2 }
    ],
    citas: [
        { id_cita: 1, fecha: '2026-07-01', hora: '09:00', motivo_consulta: 'Control rutinario hipertensión', diagnostico: 'Estable', estado: 'Agendada', id_medico: 1, id_paciente: 1, id_clinica: 'C01', nro_consultorio: 101 },
        { id_cita: 2, fecha: '2026-07-02', hora: '11:30', motivo_consulta: 'Fiebre persistente y tos', diagnostico: 'Faringitis aguda', estado: 'Completada', id_medico: 2, id_paciente: 2, id_clinica: 'C01', nro_consultorio: 102 },
        { id_cita: 3, fecha: '2026-07-01', hora: '15:00', motivo_consulta: 'Chequeo de embarazo', diagnostico: 'Evolución normal', estado: 'Agendada', id_medico: 4, id_paciente: 3, id_clinica: 'C02', nro_consultorio: 202 }
    ]
};

// Initialize Storage
if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
}

function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getCurrentSede() {
    return localStorage.getItem('SALUD_INTEGRAL_SEDE') || 'C01';
}

function getSedeName(code) {
    return code === 'C01' ? 'Salud Integral Norte' : 'Salud Integral Centro';
}

// Global UI Rendering Helpers
document.addEventListener("DOMContentLoaded", function() {
    setupSedeUI();
    
    // Auto-detect which view is loaded by running specific DOM initializations
    const view = document.body.dataset.view;
    if (view === 'welcome') initWelcomeView();
    if (view === 'dashboard') initDashboardView();
    if (view === 'pacientes') initPacientesView();
    if (view === 'clinicas') initClinicasView();
    if (view === 'medicos') initMedicosView();
    if (view === 'telefonos') initTelefonosView();
    if (view === 'consultorios') initConsultoriosView();
    if (view === 'citas') initCitasView();
});

function setupSedeUI() {
    const badge = document.getElementById('current-sede-badge');
    if (badge) {
        badge.innerText = `Sede actual: ${getSedeName(getCurrentSede())}`;
    }
}

// ----------------- PANTALLA 1: BIENVENIDA -----------------
function initWelcomeView() {
    const cards = document.querySelectorAll('.card-sede');
    let selectedSede = 'C01';
    
    // Highlight initial default
    cards.forEach(c => {
        if(c.dataset.sede === selectedSede) c.classList.add('selected');
        c.addEventListener('click', function() {
            cards.forEach(x => x.classList.remove('selected'));
            this.classList.add('selected');
            selectedSede = this.dataset.sede;
        });
    });

    document.getElementById('btn-ingresar').addEventListener('click', function() {
        localStorage.setItem('SALUD_INTEGRAL_SEDE', selectedSede);
        window.location.href = 'dashboard.html';
    });
}

// ----------------- DASHBOARD VIEW -----------------
function initDashboardView() {
    const db = getDB();
    const sede = getCurrentSede();
    
    const totalPacientes = db.pacientes.length; // Global replication simulation
    const medicosSede = db.medicos.filter(m => m.id_clinica === sede).length;
    const consultoriosSede = db.consultorios.filter(c => c.id_clinica === sede).length;
    const citasSede = db.citas.filter(c => c.id_clinica === sede).length;
    
    document.getElementById('stat-pacientes').innerText = totalPacientes;
    document.getElementById('stat-medicos').innerText = medicosSede;
    document.getElementById('stat-consultorios').innerText = consultoriosSede;
    document.getElementById('stat-citas').innerText = citasSede;

    const tbody = document.getElementById('recent-citas-tbody');
    const filteredCitas = db.citas.filter(c => c.id_clinica === sede);
    
    if (filteredCitas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay citas registradas en esta sede.</td></tr>';
        return;
    }

    filteredCitas.forEach(c => {
        const p = db.pacientes.find(x => x.id_paciente == c.id_paciente) || { nombre: 'N/A' };
        const m = db.medicos.find(x => x.id_medico == c.id_medico) || { nombre: 'N/A' };
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.fecha} - ${c.hora}</td>
            <td>${p.nombre}</td>
            <td>${m.nombre}</td>
            <td>Consultorio ${c.nro_consultorio}</td>
            <td><span class="badge-status status-${c.estado.toLowerCase()}">${c.estado}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// ----------------- CRUD: PACIENTES -----------------
function initPacientesView() {
    const db = getDB();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    
    function renderTable() {
        tbody.innerHTML = '';
        db.pacientes.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id_paciente}</td>
                <td>${p.cedula}</td>
                <td>${p.nombre}</td>
                <td>${p.edad}</td>
                <td>${p.direccion}</td>
                <td>${p.telefono}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editPaciente(${p.id_paciente})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deletePaciente(${p.id_paciente})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('id_paciente').value;
        const record = {
            id_paciente: id ? parseInt(id) : Date.now(),
            cedula: document.getElementById('cedula').value,
            nombre: document.getElementById('nombre').value,
            edad: parseInt(document.getElementById('edad').value),
            direccion: document.getElementById('direccion').value,
            telefono: document.getElementById('telefono').value
        };

        if (id) {
            const idx = db.pacientes.findIndex(p => p.id_paciente === record.id_paciente);
            db.pacientes[idx] = record;
        } else {
            db.pacientes.push(record);
        }
        saveDB(db);
        form.reset();
        document.getElementById('id_paciente').value = '';
        renderTable();
    });

    window.editPaciente = function(id) {
        const p = db.pacientes.find(x => x.id_paciente === id);
        if (p) {
            document.getElementById('id_paciente').value = p.id_paciente;
            document.getElementById('cedula').value = p.cedula;
            document.getElementById('nombre').value = p.nombre;
            document.getElementById('edad').value = p.edad;
            document.getElementById('direccion').value = p.direccion;
            document.getElementById('telefono').value = p.telefono;
        }
    };

    window.deletePaciente = function(id) {
        if (confirm('¿Está seguro de eliminar este paciente?')) {
            db.pacientes = db.pacientes.filter(x => x.id_paciente !== id);
            saveDB(db);
            renderTable();
        }
    };

    window.clearForm = function() {
        form.reset();
        document.getElementById('id_paciente').value = '';
    };

    renderTable();
}

// ----------------- CRUD: CLÍNICAS -----------------
function initClinicasView() {
    const db = getDB();
    const currentSede = getCurrentSede();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    
    // RESTRICCIÓN SOLICITADA: Si es sede Centro (C02), ocultar el formulario (Solo Lectura)
    if (currentSede === 'C02') {
        const formCell = document.querySelector('.form-cell');
        if (formCell) {
            formCell.style.display = 'none';
        }
        const viewSubtitle = document.querySelector('.view-subtitle');
        if (viewSubtitle) {
            viewSubtitle.innerText = 'Catálogo estructural de la red médica (Vista de solo lectura para esta sede).';
        }
    }

    function renderTable() {
        tbody.innerHTML = '';
        db.clinicas.forEach(c => {
            const tr = document.createElement('tr');
            // Si está oculto el formulario en C02, las acciones de edición también pierden sentido local
            const accionesHTML = currentSede === 'C02' ? 
                `<td><span style="color:var(--text-muted); font-style:italic;">No disponibles</span></td>` :
                `<td>
                    <button class="btn-action btn-edit" onclick="editClinica('${c.id_clinica}')">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteClinica('${c.id_clinica}')">Eliminar</button>
                </td>`;
            
            tr.innerHTML = `
                <td><strong>${c.id_clinica}</strong></td>
                <td>${c.nombre}</td>
                <td>${c.direccion}</td>
                <td>${c.telefono}</td>
                ${accionesHTML}
            `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const idInput = document.getElementById('id_clinica');
        const id = idInput.value.trim().toUpperCase();
        const isEdit = idInput.hasAttribute('readonly');

        const record = {
            id_clinica: id,
            nombre: document.getElementById('nombre').value,
            direccion: document.getElementById('direccion').value,
            telefono: document.getElementById('telefono').value
        };

        if (isEdit) {
            const idx = db.clinicas.findIndex(c => c.id_clinica === id);
            db.clinicas[idx] = record;
        } else {
            if (db.clinicas.some(c => c.id_clinica === id)) {
                alert('El ID de clínica ya existe.');
                return;
            }
            db.clinicas.push(record);
        }
        saveDB(db);
        form.reset();
        idInput.removeAttribute('readonly');
        renderTable();
    });

    window.editClinica = function(id) {
        const c = db.clinicas.find(x => x.id_clinica === id);
        if (c) {
            const idInput = document.getElementById('id_clinica');
            idInput.value = c.id_clinica;
            idInput.setAttribute('readonly', 'true');
            document.getElementById('nombre').value = c.nombre;
            document.getElementById('direccion').value = c.direccion;
            document.getElementById('telefono').value = c.telefono;
        }
    };

    window.deleteClinica = function(id) {
        if (confirm('¿Desea eliminar esta clínica?')) {
            db.clinicas = db.clinicas.filter(x => x.id_clinica !== id);
            saveDB(db);
            renderTable();
        }
    };

    window.clearForm = function() {
        form.reset();
        document.getElementById('id_clinica').removeAttribute('readonly');
    };

    renderTable();
}

// ----------------- CRUD: MÉDICOS -----------------
function initMedicosView() {
    const db = getDB();
    const currentSede = getCurrentSede();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    const selectClinica = document.getElementById('id_clinica');

    selectClinica.innerHTML = '';
    db.clinicas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id_clinica;
        opt.innerText = c.nombre;
        if(c.id_clinica === currentSede) opt.selected = true;
        selectClinica.appendChild(opt);
    });

    function renderTable() {
        tbody.innerHTML = '';
        const filtered = db.medicos.filter(m => m.id_clinica === currentSede);
        
        filtered.forEach(m => {
            const clinName = db.clinicas.find(c => c.id_clinica === m.id_clinica)?.nombre || m.id_clinica;
            const tr = document.createElement('tr');
            
            // Renderizado Completo Administrativo (Sede Norte / C01)
                tr.innerHTML = `
                    <td>${m.id_medico}</td>
                    <td>${m.cedula}</td>
                    <td>${m.nombre}</td>
                    <td>${m.especialidad}</td>
                    <td>${m.horario_atencion}</td>
                    <td>${clinName}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editMedico(${m.id_medico})">Editar</button>
                        <button class="btn-action btn-delete" onclick="deleteMedico(${m.id_medico})">Eliminar</button>
                    </td>
                `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('id_medico').value;
        
        // Conservar datos administrativos anteriores si se edita desde C02 (donde están ocultos)
        let existingMedico = id ? db.medicos.find(x => x.id_medico === parseInt(id)) : null;

        const record = {
            id_medico: id ? parseInt(id) : Date.now(),
            cedula: currentSede === 'C02' ? (existingMedico ? existingMedico.cedula : 'FRAGMENTADO') : document.getElementById('cedula').value,
            nombre: currentSede === 'C02' ? (existingMedico ? existingMedico.nombre : 'Médico Asignado Centro') : document.getElementById('nombre').value,
            especialidad: document.getElementById('especialidad').value,
            horario_atencion: document.getElementById('horario_atencion').value,
            id_clinica: selectClinica.value
        };

        if (id) {
            const idx = db.medicos.findIndex(m => m.id_medico === record.id_medico);
            db.medicos[idx] = record;
        } else {
            db.medicos.push(record);
        }
        saveDB(db);
        form.reset();
        document.getElementById('id_medico').value = '';
        renderTable();
    });

    window.editMedico = function(id) {
        const m = db.medicos.find(x => x.id_medico === id);
        if (m) {
            document.getElementById('id_medico').value = m.id_medico;
            if (currentSede !== 'C02') {
                document.getElementById('cedula').value = m.cedula;
                document.getElementById('nombre').value = m.nombre;
            }
            document.getElementById('especialidad').value = m.especialidad;
            document.getElementById('horario_atencion').value = m.horario_atencion;
            selectClinica.value = m.id_clinica;
        }
    };

    window.deleteMedico = function(id) {
        if (confirm('¿Eliminar médico seleccionado?')) {
            db.medicos = db.medicos.filter(x => x.id_medico !== id);
            saveDB(db);
            renderTable();
        }
    };

    window.clearForm = function() {
        form.reset();
        document.getElementById('id_medico').value = '';
    };

    renderTable();
}

// ----------------- CRUD: TELÉFONOS -----------------
function initTelefonosView() {
    const db = getDB();
    const currentSede = getCurrentSede();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    const selectMedico = document.getElementById('id_medico');

    const localMedicos = db.medicos.filter(m => m.id_clinica === currentSede);
    selectMedico.innerHTML = '';
    localMedicos.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id_medico;
        // Para C02, el nombre está oculto, usamos el identificador único de operación mas su especialidad
        opt.innerText = currentSede === 'C02' ? `Médico ID: ${m.id_medico} (${m.especialidad})` : m.nombre;
        selectMedico.appendChild(opt);
    });

    function renderTable() {
        tbody.innerHTML = '';
        db.telefonos_medico.forEach(tm => {
            const med = db.medicos.find(x => x.id_medico == tm.id_medico);
            if (!med || med.id_clinica !== currentSede) return; 

            const tr = document.createElement('tr');
            const nombreMostrar = currentSede === 'C02' ? `Especialista ID: ${med.id_medico} (${med.especialidad})` : med.nombre;
            tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${tm.telefono}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteTelefono(${tm.id_medico}, '${tm.telefono}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const record = {
            id_medico: parseInt(selectMedico.value),
            telefono: document.getElementById('telefono').value
        };

        const exists = db.telefonos_medico.some(t => t.id_medico === record.id_medico && t.telefono === record.telefono);
        if(exists) {
            alert('Este número telefónico ya se encuentra registrado para este médico.');
            return;
        }

        db.telefonos_medico.push(record);
        saveDB(db);
        document.getElementById('telefono').value = '';
        renderTable();
    });

    window.deleteTelefono = function(id_medico, telf) {
        if (confirm('¿Eliminar el teléfono asignado?')) {
            db.telefonos_medico = db.telefonos_medico.filter(x => !(x.id_medico === id_medico && x.telefono === telf));
            saveDB(db);
            renderTable();
        }
    };

    renderTable();
}

// ----------------- CRUD: CONSULTORIOS -----------------
function initConsultoriosView() {
    const db = getDB();
    const currentSede = getCurrentSede();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    const selectClinica = document.getElementById('id_clinica');

    // CONFIGURACIÓN AUTOMÁTICA DE LA SEDE: 
    // Forzamos a que el selector tenga únicamente la sede actual y quede deshabilitado
    selectClinica.innerHTML = '';
    db.clinicas.forEach(c => {
        if (c.id_clinica === currentSede) {
            const opt = document.createElement('option');
            opt.value = c.id_clinica;
            opt.innerText = c.nombre;
            opt.selected = true;
            selectClinica.appendChild(opt);
        }
    });
    selectClinica.disabled = true; // El usuario ya no puede cambiar de clínica manualmente
    
    // Opcional: Cambiar la etiqueta del contenedor para que el usuario sepa que es automático
    const clinicaGroup = selectClinica.closest('.form-group');
    if (clinicaGroup) {
        const label = clinicaGroup.querySelector('label');
        if (label) label.innerText = 'Clínica';
    }

    function renderTable() {
        tbody.innerHTML = '';
        // Filtrado estricto por fragmentación horizontal: Solo consultorios de esta sede
        const filtered = db.consultorios.filter(c => c.id_clinica === currentSede);
        
        filtered.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Consultorio ${c.nro_consultorio}</td>
                <td>${c.tipo_atencion}</td>
                <td>Piso ${c.piso}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editConsultorio('${c.id_clinica}', ${c.nro_consultorio})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteConsultorio('${c.id_clinica}', ${c.nro_consultorio})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nroInput = document.getElementById('nro_consultorio');
        const nro = parseInt(nroInput.value);
        const isEdit = nroInput.hasAttribute('readonly');

        // CAMBIO KEY: Se usa directamente 'currentSede' para garantizar la integridad del fragmento horizontal
        const record = {
            id_clinica: currentSede, 
            nro_consultorio: nro,
            tipo_atencion: document.getElementById('tipo_atencion').value,
            piso: parseInt(document.getElementById('piso').value)
        };

        if (isEdit) {
            const idx = db.consultorios.findIndex(c => c.id_clinica === currentSede && c.nro_consultorio === nro);
            db.consultorios[idx] = record;
        } else {
            // Validación local: Evitar duplicados del número de consultorio dentro del mismo nodo
            if (db.consultorios.some(c => c.id_clinica === currentSede && c.nro_consultorio === nro)) {
                alert(`El consultorio No. ${nro} ya existe en esta sede (${getSedeName(currentSede)}).`);
                return;
            }
            db.consultorios.push(record);
        }
        
        saveDB(db);
        form.reset();
        
        // Mantener el estado correcto post-submit
        nroInput.removeAttribute('readonly');
        selectClinica.value = currentSede;
        selectClinica.disabled = true; 
        
        renderTable();
    });

    window.editConsultorio = function(id_clinica, nro) {
        const c = db.consultorios.find(x => x.id_clinica === id_clinica && x.nro_consultorio === nro);
        if (c) {
            const nroInput = document.getElementById('nro_consultorio');
            nroInput.value = c.nro_consultorio;
            nroInput.setAttribute('readonly', 'true'); // No dejar cambiar la PK compuesta en edición
            
            selectClinica.value = currentSede;
            selectClinica.disabled = true;
            
            document.getElementById('tipo_atencion').value = c.tipo_atencion;
            document.getElementById('piso').value = c.piso;
        }
    };

    window.deleteConsultorio = function(id_clinica, nro) {
        if (confirm(`¿Está seguro de eliminar el Consultorio ${nro} de esta sede?`)) {
            db.consultorios = db.consultorios.filter(x => !(x.id_clinica === id_clinica && x.nro_consultorio === nro));
            saveDB(db);
            renderTable();
        }
    };

    window.clearForm = function() {
        form.reset();
        document.getElementById('nro_consultorio').removeAttribute('readonly');
        selectClinica.value = currentSede;
        selectClinica.disabled = true;
    };

    renderTable();
}
// ----------------- CRUD: CITAS MÉDICAS -----------------
function initCitasView() {
    const db = getDB();
    const currentSede = getCurrentSede();
    const tbody = document.getElementById('table-tbody');
    const form = document.getElementById('crud-form');
    
    const selectMed = document.getElementById('id_medico');
    const selectPac = document.getElementById('id_paciente');
    const selectCons = document.getElementById('nro_consultorio');

    selectMed.innerHTML = '';
    db.medicos.filter(m => m.id_clinica === currentSede).forEach(m => {
        let o = document.createElement('option'); 
        o.value = m.id_medico; 
        o.innerText = currentSede === 'C02' ? `Especialista ID: ${m.id_medico} (${m.especialidad})` : m.nombre; 
        selectMed.appendChild(o);
    });

    selectPac.innerHTML = '';
    db.pacientes.forEach(p => {
        let o = document.createElement('option'); o.value = p.id_paciente; o.innerText = p.nombre; selectPac.appendChild(o);
    });

    selectCons.innerHTML = '';
    db.consultorios.filter(c => c.id_clinica === currentSede).forEach(c => {
        let o = document.createElement('option'); o.value = c.nro_consultorio; o.innerText = `Consultorio ${c.nro_consultorio} (${c.tipo_atencion})`; selectCons.appendChild(o);
    });

    function renderTable() {
        tbody.innerHTML = '';
        const filtered = db.citas.filter(c => c.id_clinica === currentSede);
        
        filtered.forEach(c => {
            const mRecord = db.medicos.find(x => x.id_medico == c.id_medico);
            const med = mRecord ? (currentSede === 'C02' ? `Especialista ID: ${mRecord.id_medico} (${mRecord.especialidad})` : mRecord.nombre) : 'N/A';
            const pac = db.pacientes.find(x => x.id_paciente == c.id_paciente)?.nombre || 'N/A';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id_cita}</td>
                <td>${c.fecha} / ${c.hora}</td>
                <td>${pac}</td>
                <td>${med}</td>
                <td>No. ${c.nro_consultorio}</td>
                <td>${c.motivo_consulta}</td>
                <td><span class="badge-status status-${c.estado.toLowerCase()}">${c.estado}</span></td>
                <td>
                    <button class="btn-action btn-edit" onclick="editCita(${c.id_cita})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteCita(${c.id_cita})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('id_cita').value;
        const record = {
            id_cita: id ? parseInt(id) : Date.now(),
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            motivo_consulta: document.getElementById('motivo_consulta').value,
            diagnostico: document.getElementById('diagnostico').value,
            estado: document.getElementById('estado').value,
            id_medico: parseInt(selectMed.value),
            id_paciente: parseInt(selectPac.value),
            id_clinica: currentSede,
            nro_consultorio: parseInt(selectCons.value)
        };

        if (id) {
            const idx = db.citas.findIndex(c => c.id_cita === record.id_cita);
            db.citas[idx] = record;
        } else {
            db.citas.push(record);
        }
        saveDB(db);
        form.reset();
        document.getElementById('id_cita').value = '';
        renderTable();
    });

    window.editCita = function(id) {
        const c = db.citas.find(x => x.id_cita === id);
        if (c) {
            document.getElementById('id_cita').value = c.id_cita;
            document.getElementById('fecha').value = c.fecha;
            document.getElementById('hora').value = c.hora;
            document.getElementById('motivo_consulta').value = c.motivo_consulta;
            document.getElementById('diagnostico').value = c.diagnostico;
            document.getElementById('estado').value = c.estado;
            selectMed.value = c.id_medico;
            selectPac.value = c.id_paciente;
            selectCons.value = c.nro_consultorio;
        }
    };

    window.deleteCita = function(id) {
        if (confirm('¿Cancelar o eliminar permanentemente la cita seleccionada?')) {
            db.citas = db.citas.filter(x => x.id_cita !== id);
            saveDB(db);
            renderTable();
        }
    };

    window.clearForm = function() {
        form.reset();
        document.getElementById('id_cita').value = '';
    };

    renderTable();
}