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
