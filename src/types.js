declare class $ImageCapture = {
  grabFrame: () => Promise<any>;
  takePhoto: () => Promise<Blob>;
};
