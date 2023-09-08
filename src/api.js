import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export default class ApiService {
  constructor() {
    this.page = 0;
    this.qValue = '';
    this.totalHits = 0;
    this.gallery = document.querySelector('.gallery');
    this.loadMoreBtn = document.querySelector('.load-more');
  }

  async fetchPosts(qValue) {
    try {
      if (this.qValue === qValue) {
        this.nexPage();
      } else {
        this.startPage();
        this.qValue = qValue;
      }

      const data = await this.fetchDataFromApi(qValue);

      if (data.hits.length === 0) {
        this.handleNoImagesFound();
        return;
      }

      if (this.page === 1) {
        this.totalHits = data.totalHits;
      }

      if (data.hits.length < 40 || this.page * 40 >= this.totalHits) {
        this.loadMoreBtn.classList.add('is-hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }

      this.loadMoreBtn.classList.remove('is-hidden');

      return data.hits;
    } catch (error) {
      console.log(error);
    }
  }

  async fetchDataFromApi(qValue) {
    const URL = 'https://pixabay.com/api/';

    const params = new URLSearchParams({
      key: '39241536-66dae2114b9b26bf6aee96b4f',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: 40,
      q: `${qValue}`,
    });

    const respons = await axios.get(`${URL}/?${params}&page=${this.page}`);

    return respons.data;
  }

  handleNoImagesFound() {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    this.gallery.innerHTML = '';
    this.loadMoreBtn.classList.add('is-hidden');
  }

  nexPage() {
    this.page += 1;
  }

  startPage() {
    this.page = 1;
  }
}
