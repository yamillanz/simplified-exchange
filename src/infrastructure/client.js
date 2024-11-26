const Link = require('grenache-nodejs-link');
const { PeerRPCClient } = require('grenache-nodejs-http');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const peerClient = new PeerRPCClient(link, {});
peerClient.init();

const sendOrder = (order) => {
  peerClient.request(
    'exchange_service',
    { method: 'addOrder', data: order },
    { timeout: 30000 },
    (err, result) => {
      if (err) {
        console.error('Error sending order:', err);
      } else {
        console.log(result);
      }
    }
  );
};

const order = {
  id: 'order1',
  type: 'buy',
  price: 100,
  quantity: 1
};

sendOrder(order);