export const isTextOrRelated = (msg) => {
  return isText(msg) || isGif(msg) || isSticker(msg);
};

export const isText = (msg) => {
  if (msg.text) {
    return true;
  }

  return false;
}

export const isPhoto = (msg) => {
  if (msg.photo) {
    return true;
  }

  return false;
}

export const isVideo = (msg) => {
  if (msg.video) {
    return true;
  }

  return false;
}

export const isFile = (msg) => {
  if (msg.document && !msg.animation) {
    return true;
  }

  return false;
}

export const isGif = (msg) => {
  if (msg.animation && msg.document) {
    return true;
  }

  return false;
}

export const isSticker = (msg) => {
  if (msg.sticker) {
    return true;
  }

  return false;
}
