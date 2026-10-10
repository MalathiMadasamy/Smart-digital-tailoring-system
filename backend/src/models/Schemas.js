// Model Schemas definition for MongoDB Mongoose / PostgreSQL ORM
const UserModel = {
  name: 'User',
  fields: { id: 'String', name: 'String', email: 'String', phone: 'String', role: 'String', passwordHash: 'String', createdAt: 'Date' }
};

const ProductModel = {
  name: 'Product',
  fields: { id: 'String', title: 'String', department: 'String', subCategory: 'String', fabric: 'String', price: 'Number', rating: 'Number', imgUrl: 'String' }
};

const MeasurementModel = {
  name: 'Measurement',
  fields: { id: 'String', userId: 'String', profileName: 'String', values: 'Object' }
};

const CustomDesignModel = {
  name: 'CustomDesign',
  fields: { id: 'String', userId: 'String', dressType: 'String', fabric: 'String', color: 'String', sleeve: 'String', neckStyle: 'String', embroidery: 'String', price: 'Number' }
};

const OrderModel = {
  name: 'Order',
  fields: { id: 'String', userId: 'String', items: 'Array', total: 'Number', status: 'String', tailorAssigned: 'String', paymentMethod: 'String', createdAt: 'Date' }
};

const PaymentModel = {
  name: 'Payment',
  fields: { id: 'String', orderId: 'String', amount: 'Number', method: 'String', status: 'String', txnId: 'String' }
};

const ReviewModel = {
  name: 'Review',
  fields: { id: 'String', orderId: 'String', rating: 'Number', comment: 'String', date: 'Date' }
};

module.exports = {
  UserModel,
  ProductModel,
  MeasurementModel,
  CustomDesignModel,
  OrderModel,
  PaymentModel,
  ReviewModel,
};
