require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Configura la conexión a PostgreSQL
const pool = new Pool({
    connectionString: process.env.PG_URI,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Configura el transporter de nodemailer igual que antes
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ruta para recibir mensajes
app.post('/api/contacto', async (req, res) => {
    const { nombre, telefono, correo, mensaje } = req.body;
    try {
        // Guarda el mensaje en PostgreSQL
        await pool.query(
            'INSERT INTO mensajes (nombre, telefono, correo, mensaje, fecha) VALUES ($1, $2, $3, $4, NOW())',
            [nombre, telefono, correo, mensaje]
        );

        // Envía el correo igual que antes
        await transporter.sendMail({
            from: '"Web Contacto" <wessinnassim@gmail.com>',
            to: 'wessinnassim@gmail.com, nassimwhazim@gmail.com',
            subject: 'Nuevo mensaje de tu web',
            text: `
Nuevo mensaje recibido:
Nombre: ${nombre}
Teléfono: ${telefono}
Correo: ${correo}
Mensaje: ${mensaje}
            `
        });

        res.json({ ok: true, mensaje: 'Mensaje guardado y correo enviado' });
    } catch (err) {
        console.error('Error en /api/contacto:', err); // <-- Agrega esta línea
        res.status(500).json({ ok: false, error: 'Error al guardar o enviar el mensaje' });
    }
});

// Ruta para ver todos los mensajes (opcional)
app.get('/api/mensajes', async (req, res) => {
    const result = await pool.query('SELECT * FROM mensajes ORDER BY fecha DESC');
    res.json(result.rows);
});

app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});