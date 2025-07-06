module.exports = {
    mongodbMemoryServerOptions: {
      binary: {
        version: '6.0.0'
      },
      autoStart: false,
      instance: {
        dbName: 'test'
      }
    }
  };