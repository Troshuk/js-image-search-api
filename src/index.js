import PixabayAPI from './js/pixabay-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import throttle from 'lodash.throttle';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'modern-normalize/modern-normalize.css';

const refs = {
  galleryList: document.querySelector('div.gallery'),
  searchForm: document.querySelector('.search-form'),
  searchButton: document.querySelector('.search-form button'),
  loadMoreButton: document.querySelector('button.load-more'),
};

const searchGallery = new SimpleLightbox('.gallery a', {});

displayLoadMoreBtn(false);

const imageApi = new PixabayAPI();

refs.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = e.target.elements.searchQuery.value;

  if (!query) return;

  queryImages(query);
});

refs.loadMoreButton.addEventListener('click', loadMore);

window.addEventListener(
  'scroll',
  throttle(() => {
    if (
      window.scrollY + window.innerHeight >=
      document.body.offsetHeight - 300
    ) {
      loadMore();
    }
  }, 500)
);

async function queryImages(query) {
  try {
    const result = await imageApi.search(query);

    disableSearchBtn(true);
    displayLoadMoreBtn(false);

    if (!result.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      refs.galleryList.innerHTML = '';

      return;
    }

    Notify.success(`Hooray! We found ${result.totalHits} images.`);

    refs.galleryList.innerHTML = createGalleryList(result.hits);
    displayLoadMoreBtn(true);
    disableLoadMoreBtn(false);
    searchGallery.refresh();
  } catch (error) {
    Notify.failure('Oops! Something went wrong! Try reloading the page!');
    console.error(error);
  } finally {
    disableSearchBtn(false);
  }
}

async function loadMore() {
  try {
    if (refs.loadMoreButton.disabled) return;

    const result = await imageApi.loadMore();
    disableLoadMoreBtn(true);

    refs.galleryList.insertAdjacentHTML(
      'beforeend',
      createGalleryList(result.hits)
    );
    disableLoadMoreBtn(false);
    searchGallery.refresh();
    smoothScroll();
  } catch (error) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    console.error(error);
    displayLoadMoreBtn(false);
    disableLoadMoreBtn(true);

    return;
  }
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

function displayLoadMoreBtn(shouldDisplay) {
  if (shouldDisplay) {
    refs.loadMoreButton.classList.remove('is-hidden');
  } else {
    refs.loadMoreButton.classList.add('is-hidden');
  }
}

function disableLoadMoreBtn(shouldDisable) {
  refs.loadMoreButton.disabled = shouldDisable;
}

function disableSearchBtn(shouldDisable) {
  refs.searchButton.disabled = shouldDisable;
}

function createGalleryList(images) {
  return images.map(createGalleryCard).join('');
}

function createGalleryCard({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
        <div class="photo-card" data-large-image="${largeImageURL}">
            <a href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>
                    <span>${likes}</span>
                </p>
                <p class="info-item">
                    <b>Views</b>
                    <span>${views}</span>
                </p>
                <p class="info-item">
                    <b>Comments</b>
                    <span>${comments}</span>
                </p>
                <p class="info-item">
                    <b>Downloads</b>
                    <span>${downloads}</span>
                </p>
            </div>
        </div>
    `;
}
