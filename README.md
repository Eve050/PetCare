# PetCare

Plataforma web para identificar y cuidar perros y gatos con un llavero NFC. El panel del dueño y el perfil público guardan los datos en un servidor Node de este mismo proyecto.

## Cómo verlo

Hacen falta dos procesos, y `npm run dev` los arranca juntos: la API en el puerto 8787 y la web de Vite.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Cuenta de ejemplo

- Correo: `evelyn@petcare.ec`
- Contraseña: `Petcare2026`

En iniciar sesión también está el botón **Usar la cuenta de ejemplo**. Esa cuenta ya tiene a Max, sus cuidados y el llavero `NFC-7F3A9C2E18B4`.

## Qué queda guardado

El servidor escribe `server/data/db.json`. Ahí están las cuentas, las mascotas, los cuidados, los llaveros y los avisos de quien encuentra a un animal. Las contraseñas se guardan cifradas. Si borras ese archivo, la próxima vez que arranque el servidor vuelve a crear la cuenta de Evelyn y a Max.

Una cuenta nueva entra al panel vacía. Al registrar una mascota, el servidor crea su ficha y un código NFC. El perfil público se abre en `/perfil/el-codigo`, sin iniciar sesión. Si el llavero está activo y la dueña lo autorizó, quien lo escanea ve el celular o puede enviar un aviso a la campana del panel.

## Recorrido

1. Iniciar sesión, crear una cuenta o recuperar la contraseña.
2. El panel de inicio muestra la mascota elegida, sus próximos cuidados y el aviso de privacidad.
3. **Reportar como extraviado** cambia la etiqueta y el perfil público.
4. **Ver perfil público** abre lo que vería alguien al escanear el llavero, sin cuenta.
5. Desde ese perfil se puede enviar un aviso. Aparece en la campana del panel.
6. En **Ajustes** se elige si el celular y el formulario se muestran, y se actualizan el nombre y el teléfono.
7. En **Llaveros NFC** se simula el escaneo y se puede desactivar el llavero.
8. En **Mis mascotas** se registra otra mascota. En **Cuidados** se agrega una vacuna, una cita o una desparasitación.

## Paleta

Verde `#1E7A46` y `#156038`, menta `#E7F4EC`, fondo `#F4F3EE`, alerta `#C4513C`.

La fotografía de Max es de ejemplo (Unsplash) y sirve solo para la maqueta.
