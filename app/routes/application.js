import Ember from 'ember';
import RSVP from 'rsvp';
import sources from '../sources';
import carto from '../utils/carto2';

const { service } = Ember.inject;

export default Ember.Route.extend({
  mainMap: service(),

  beforeModel(transition) {
    console.log(transition);
    if (transition.intent.url === '/') {
      this.transitionTo('about');
    }
  },

  model() {
    const cartoSourcePromises = Object.keys(sources)
      .filter(key => sources[key].type === 'cartovector')
      .map((key) => {
        const source = sources[key];
        const { minzoom = 0 } = source;

        return carto.getVectorTileTemplate(source['source-layers'])
          .then(template => ({
            id: source.id,
            type: 'vector',
            tiles: [template],
            minzoom,
          }));
      });

    return RSVP.hash({
      cartoSources: Promise.all(cartoSourcePromises),
      bookmarks: this.store.findAll('bookmark').then((bookmarks) => {
        bookmarks.invoke('get', 'bookmark');
        return bookmarks;
      }),
    });
  },

  afterModel() {
    this.get('mainMap').resetBounds();
  },
});
