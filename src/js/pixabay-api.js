import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '4120348-c5076dbfa21dbf0fa2fcd6f88';
const IMAGE_ENDPOINT = '';
const PER_PAGE = 40;

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
  },
});

export default class PixabayAPI {
  #query;
  #page = 1;

  async search(query) {
    this.#page = 1;
    this.#query = query;

    return this.#fetchImages();
  }

  async loadMore() {
    this.#page++;

    try {
      const result = await this.#fetchImages();
      if (!result.hits.length) throw Exception('End of list, no more results');

      return result;
    } catch (error) {
      this.#page--;
      throw error;
    }
  }

  async #fetchImages() {
    const response = await api.get(IMAGE_ENDPOINT, {
      params: {
        q: this.#query,
        page: this.#page,
      },
    });

    return response.data;
  }
}
