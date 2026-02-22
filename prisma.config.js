import { defineConfig } from '@prisma/client/config'

export default defineConfig({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hardware_hub'
    }
  }
})