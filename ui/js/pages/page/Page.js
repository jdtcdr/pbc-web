"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import PageContents from './PageContents';

class Page extends Component {

  componentDidMount () {
    if (! this.props.page) {
      getItem('pages', this.props.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Page catch', error));
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      ! nextProps.page) {
      getItem('pages', nextProps.params.id, { cache: true, populate: true })
      .catch(error => console.log('!!! Page catch', error));
    }
  }

  render () {
    const { page } = this.props;
    let contents;
    if (page) {
      contents = <PageContents item={page} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="pages" item={page} />
        {contents}
      </main>
    );
  }
};

Page.propTypes = {
  page: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

const select = (state, props) => {
  let page;
  if (state.pages) {
    page = state.pages[props.params.id];
  }
  return {
    page: page
  };
};

export default Stored(Page, select);
