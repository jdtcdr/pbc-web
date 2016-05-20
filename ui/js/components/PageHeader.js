"use strict";
import React, { Component, PropTypes } from 'react';

export default class PageHeader extends Component {

  constructor () {
    super();
    this._onHome = this._onHome.bind(this);
    this._onBack = this._onBack.bind(this);
  }

  _onHome () {
    this.context.router.push('/');
  }

  _onBack () {
    this.context.router.goBack();
  }

  render () {
    const { title, searchText, onSearch, actions, form, back, homer } = this.props;
    let classes = ["page-header"];
    if (form) {
      classes.push("page-header--form");
    }

    let backControl;
    if (homer) {
      backControl = (
        <button className="page-header__back" onClick={this._onHome}>Home</button>
      );
    } else if (back) {
      backControl = (
        <button className="page-header__back" onClick={this._onBack}>&lt;</button>
      );
    }

    let search;
    if (onSearch) {
      search = (
        <input className="page-header__search"
          placeholder="Search"
          value={searchText} onChange={onSearch} />
      );
    }

    return (
      <header className={classes.join(' ')}>
        {backControl}
        <span className="page-header__main">
          <h1 className="page-header__title">{title}</h1>
          {search}
        </span>
        {actions}
      </header>
    );
  }
};

PageHeader.propTypes = {
  actions: PropTypes.node,
  back: PropTypes.bool,
  color: PropTypes.string,
  form: PropTypes.bool,
  homer: PropTypes.bool,
  onSearch: PropTypes.func,
  searchText: PropTypes.string,
  title: PropTypes.string.isRequired
};

PageHeader.contextTypes = {
  router: PropTypes.any
};
