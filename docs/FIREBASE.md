# Configuración Firebase (formulario + panel admin)

## 1. Firestore

1. Firebase Console → **Build → Firestore Database → Create database**
2. Modo: **Start in production mode**
3. Elige ubicación (p. ej. `nam5` o la más cercana)

## 2. Reglas de seguridad

Firestore → **Rules** → pegar y **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /solicitudes/{id} {
      allow create: if request.resource.data.nombre is string
        && request.resource.data.nombre.size() > 0
        && request.resource.data.nombre.size() <= 100
        && request.resource.data.mensaje is string
        && request.resource.data.mensaje.size() >= 10
        && request.resource.data.mensaje.size() <= 4000
        && request.resource.data.keys().hasOnly([
          'nombre', 'email', 'medio', 'motivo', 'mensaje',
          'createdAt', 'leido', 'likes', 'respuestas'
        ]);

      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## 3. Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method → Email/Password → Enable**
3. **Users → Add user**: tu correo y una contraseña fuerte (no la publiques)

## 4. Uso en el sitio

- Formulario: `html/contacto.html`
- Panel admin: `html/admin.html` (ej. `https://ricardot005.github.io/Mi_Portafolio/html/admin.html`)

Los "me gusta" se hacen desde el panel (usuario autenticado) para evitar spam.
