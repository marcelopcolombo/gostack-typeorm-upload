import { Router } from 'express';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import { getCustomRepository } from 'typeorm';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const createTransactionService = new CreateTransactionService();


const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({transactions, balance});
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  try {
    const createTransaction = new CreateTransactionService()
    const transaction = await createTransaction.execute({
      title, value, type, category
    });
    return response.status(200).json(transaction);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }

  // TODO
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204);
});

transactionsRouter.post('/import',
upload.single('file'),
async (request, response) => {
  const importTransactions = new ImportTransactionsService();

  const transactions = await importTransactions.execute(request.file.path);

  return response.json(transactions);
});

export default transactionsRouter;
