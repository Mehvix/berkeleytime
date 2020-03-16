import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import HashLoader from 'react-spinners/HashLoader';

import axios from 'axios';

import Filter from '../../components/Catalog/Filter';
import FilterResults from '../../components/Catalog/FilterResults';
import ClassDescriptionModal from '../../components/ClassDescription/ClassDescriptionModal';
import ClassDescription from '../../components/ClassDescription/ClassDescription';

import { modify, fetchLists, modifySelected } from '../../redux/actions';
import { connect } from "react-redux";


/**
 * catalog_json API
 *
 * each playlist is an integer, representing a list of classes
 *
 * data:
 *   default_playlists - array of the default playlists
 *   engineering - array of engineering requirement playlists
 *   haas - array of haas requirement playlists
 *   ls - array of l&s requirement playlists
 *   level - array of class level requirement playlists
 *   semester - array of semester playlists
 *   units - array of unit playlists
 *   university - array of university requirement playlists
 */

class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultSearch: this.getDefaultSearch(), // default search, set if URL contains a specific class
      search: '',                    // current search
      sortBy: 'average_grade',       // either average_grade, ...
      // activePlaylists: new Set(),    // set of integers
      // defaultPlaylists: new Set(),   // set of integers
      // data: {},                      // api response.data
      // selectedCourse: {},
      // loading: true,             // whether we have receieved playlist data from api
      isMobile: false,                //whether to open filter result as modal
      showDescription: false,
    };

    this.updateScreensize = this.updateScreensize.bind(this);
  }

  /**
   * Checks if user is on mobile view
   */
  componentDidMount() {
    this.updateScreensize();
    window.addEventListener("resize", this.updateScreensize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreensize);
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentWillMount() {
    const { fetchLists, data, activePlaylists} = this.props;
    const paths = this.props.history.location.pathname.split('/');
    // console.log(activePlaylists);
    fetchLists(paths);
  }

  // Sets the default search based on url path
  getDefaultSearch = () => {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      return `${abbreviation} ${classNum} `;
    } else {
      return '';
    }
  }

  /**
   * @param {String} search
   *
   * Updates state.search
   */
  searchHandler = search => {
    this.setState({
      search
    });
  }

  /**
   * @param {String} sortBy
   * Sorts courses based on sortAttribute
   */
  sortHandler = sortBy => {
    this.setState({
      sortBy
    })
  }

  modifyFilters = (add, remove) => {
    const { modify, defaultPlaylists, activePlaylists } = this.props;
    let newActivePlaylists = new Set(activePlaylists);
    for (let filterId of remove) {
      newActivePlaylists.delete(filterId);
    }
    for (let filterId of add) {
      newActivePlaylists.add(filterId);
    }
    modify(newActivePlaylists, defaultPlaylists);
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilters = () => {
    const { modify, defaultPlaylists } = this.props;
    let newActivePlaylists = new Set(defaultPlaylists);
    modify(newActivePlaylists, defaultPlaylists);
    this.setState({
      defaultSearch: '',
      search: '',
      sortBy: 'average_grade',
    });
  }

  selectCourse = (course, tab=0) => {
    const { modifySelected } = this.props;
    this.setState({showDescription: true}); //show modal if on mobile
    if (tab === 0) {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/`);
    } else {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/sections/`);
    }
    modifySelected(course);
  }

  /**
   * @param {Array} filters
   * Builds the playlists returned by the catalog API into a format that can be processed by the filter
   */
  buildPlaylists = () => {
    const {
      university,
      ls,
      engineering,
      haas,
      units,
      department,
      level,
      semester
    } = this.props.data;

    var requirements = [];

    requirements.push({
      label: 'University Requirements',
      options: university ? university.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'L&S Breadths',
      options: ls ? ls.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'College of Engineering',
      options: engineering ? engineering.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'Haas Breadths',
      options: haas ? haas.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    var departmentsPlaylist = department ? department.map(req => {
      return {
        value: req.id,
        label: req.name,
      };
    }) : [];

    if (departmentsPlaylist[0].label === '-') {
      // non-existent department???
      departmentsPlaylist.splice(0, 1);
    }

    var unitsPlaylist = units ? units.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    var levelsPlaylist = level ? level.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    var semestersPlaylist = semester ? semester.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    return {
      requirements,
      departmentsPlaylist,
      unitsPlaylist,
      levelsPlaylist,
      semestersPlaylist,
    }
  }

  updateScreensize() {
    this.setState({ isMobile: window.innerWidth <= 576 });
  }

  hideModal = () => {
    this.setState({ showDescription: false})
  };

  render() {
    const { defaultSearch, isMobile, showDescription } = this.state;
    const { activePlaylists, loading, selectedCourse } = this.props;
    console.log(selectedCourse)
    return (
      <div className="catalog viewport-app">
          <Row>
            <Col md={3} lg={4} xl={3} className="filter-column">
              {
                !loading ?
                   <Filter
                    playlists={this.buildPlaylists()}
                    defaultSearch={defaultSearch}
                    searchHandler={this.searchHandler}
                    sortHandler={this.sortHandler}
                    modifyFilters={this.modifyFilters}
                    resetFilters={this.resetFilters}
                  /> :
                <div className="filter">
                  <div className="filter-loading">
                    <HashLoader
                      color="#579EFF"
                      size="50"
                      sizeUnit="px"
                    />
                  </div>
                </div>
              }
            </Col>
            <Col md={3} lg={4} xl={3} className="filter-results-column">
              <FilterResults
                activePlaylists={activePlaylists ? activePlaylists : []}
                selectCourse={this.selectCourse}
                selectedCourse={selectedCourse}
                sortBy={this.state.sortBy}
                query={this.state.search}
              />
            </Col>
            <Col md={6} lg={4} xl={6} className="catalog-description-column">
              {
                !isMobile ? 
                  <ClassDescription
                  course={selectedCourse}
                  selectCourse={this.selectCourse}
                /> :
                <ClassDescriptionModal 
                  course={selectedCourse}
                  selectCourse={this.selectCourse}
                  show={showDescription}
                  hideModal={this.hideModal}
                />
              }
            </Col> 
          </Row>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    modify: (activePlaylists, defaultPlaylists) => dispatch(modify(activePlaylists, defaultPlaylists)),
    fetchLists: (paths) => dispatch(fetchLists(paths)),
    modifySelected: (data) => dispatch(modifySelected(data)),
  }
}

const mapStateToProps = state => {
  const { activePlaylists, defaultPlaylists, data, loading, selectCourse } = state.catalog;
  return {
    activePlaylists: activePlaylists,
    defaultPlaylists: defaultPlaylists,
    data: data,
    loading: loading,
    selectedCourse: selectCourse,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Catalog));
