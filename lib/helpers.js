// lib/helper.jsx

export const serializeCarData = (car, wishlisted = false) => {
  return {
    ...car,
    price: car.price ? Number(car.price) : 0,   // ✅ best practice
    createdAt: car.createdAt ? car.createdAt.toISOString() : null,
    updatedAt: car.updatedAt ? car.updatedAt.toISOString() : null,
    wishlisted,
  };
};
