# Utiliza una imagen oficial de Node.js como base
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install --production

# Copia el resto de la aplicación
COPY . .

# Expone el puerto en el que corre la app
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]

# Construye la imagen Docker:
# docker build -t gestor-productos .

# Crea y ejecuta el contenedor
# docker run -d -p 3000:3000 --name gestor-productos gestor-productos

# Accede a la aplicacion en el navegador en http://localhost:3000