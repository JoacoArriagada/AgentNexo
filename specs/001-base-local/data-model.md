# Data model: Base local

Actor: id fijo único, name, roles visitor/buyer/provider/admin; Ana compradora, Marcos proveedor,
Rocío administradora y árbitra independiente. No password/session/token.
Config: clave única, valor estructurado y versión; timezone America/Santiago, flags demo.
Event: identidad única, secuencia ordenada, actor, acción, resourceId y timestamp UTC.
SQLite con FK, WAL y transacciones breves; seed idempotente, versión de esquema.
Importes posteriores INTEGER/bigint y cadenas JSON, nunca float. No código completo en logs.
