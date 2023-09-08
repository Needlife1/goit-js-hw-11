import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ApiService from './api.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const apiService = new ApiService();
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

apiService.loadMoreBtn.addEventListener('click', loadMore);
form.addEventListener('submit', onSubmit);

let previousQuery = '';

async function onSubmit(e) {
  e.preventDefault();
  const inputValue = getInputValue();
  if (!inputValue) {
    Notify.failure('Please enter text');
    return;
  }

  await fetchAndRenderImages(inputValue, true);
}

async function loadMore() {
  const inputValue = getInputValue();

  await fetchAndRenderImages(inputValue, false);
  smoothScroll();
}

function getInputValue() {
  return form.elements.searchQuery.value.trim();
}

async function fetchAndRenderImages(inputValue, isFormSubmit) {
  try {
    const data = await apiService.fetchPosts(inputValue);
    console.log(data);
    if (data) {
      const markup = renderCard(data);
      if (inputValue === previousQuery) {
        rendersCardsForCurrentRequest(markup);
        lightbox.refresh();
      } else {
        previousQuery = inputValue;
        rendersCardsForNewRequest(markup);
        lightbox.refresh();
        if (isFormSubmit) {
          Notify.success('Here is what we found for you.');
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function renderCard(data) {
  return data
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
       <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" height="220" width="320" />
</a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views:</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments:</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b> ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');
}

function rendersCardsForCurrentRequest(markup) {
  apiService.gallery.insertAdjacentHTML('beforeend', markup);
}

function rendersCardsForNewRequest(markup) {
  apiService.gallery.innerHTML = markup;
  window.scrollTo(0, 0);
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
