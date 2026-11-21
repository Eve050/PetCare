# PetCare

Prototipo web de la plataforma de identificación y cuidado de mascotas con llavero NFC. Esta etapa muestra la interfaz y la navegación. Los datos se quedan en el navegador: todavía no hay Firebase.

## Cómo verlo

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Cuenta de ejemplo

- Correo: `evelyn@petcare.ec`
- Contraseña: `Petcare2026`

En iniciar sesión también está el botón **Rellenar cuenta de ejemplo**.

## Recorrido

1. Iniciar sesión, crear una cuenta o recuperar la contraseña.
2. El panel de inicio muestra a Max, sus próximos cuidados y el aviso de privacidad.
3. **Reportar como extraviado** cambia la etiqueta y el perfil público.
4. **Ver perfil público** abre lo que vería alguien al escanear el llavero, sin cuenta.
5. Desde ese perfil se puede enviar un aviso. Aparece en la campana del panel.
6. En **Ajustes** se elige si el celular y el formulario se muestran.
7. En **Llaveros NFC** se simula el escaneo y se puede desactivar el llavero.
8. En **Mis mascotas** se puede registrar otra mascota de ejemplo.

## Paleta

Verde `#1E7A46` y `#156038`, menta `#E7F4EC`, fondo `#F4F3EE`, alerta `#C4513C`. La misma familia de color del panel de inicio.

La fotografía de Max es de ejemplo (Unsplash) y sirve solo para la maqueta.
