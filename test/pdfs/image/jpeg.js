module.exports = function (doc, { image, lorem }) {
  doc.image(image.jpeg, {
    width: 64,
    align: "center",
    wrap: false,
    x: 10,
    y: 30,
  });

  doc.text(lorem.shorter);

  doc.image(image.jpeg);

  doc.image(image.jpeg, {
    width: 128,
    align: "left",
  });

  doc.image(image.jpeg, {
    height: 55,
    align: "center",
  });

  doc.image(image.jpeg, {
    width: 128,
    align: "right",
  });

  doc.text(lorem.shorter);
};
