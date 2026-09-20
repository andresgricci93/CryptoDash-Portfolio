import express from 'express';
import {
  getLatestEdition,
  getNews
} from '../controllers/news.controller.js';

const router = express.Router();

router.get('/news/editions/latest', getLatestEdition);
router.get('/news', getNews);

export default router;
