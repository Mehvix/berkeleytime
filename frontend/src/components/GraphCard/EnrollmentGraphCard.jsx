import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axios from 'axios';

import vars from '../../variables/Variables';

import EnrollmentGraph from '../Graphs/EnrollmentGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';

class EnrollmentGraphCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enrollmentData: [],
      graphData: [],
      hoveredClass: false,
    };

    this.updateLineHover = this.updateLineHover.bind(this);
    this.updateGraphHover = this.updateGraphHover.bind(this);
  }

  componentDidMount() {
    this.getEnrollmentData();
  }

  componentDidUpdate(prevProps) {
    const { classData } = this.props;
    if (classData !== prevProps.classData) {
      this.getEnrollmentData();
    }
  }

  getEnrollmentData() {
    const { classData } = this.props;
    let promises = [];

    for(let course of classData) {
      let { instructor, courseID, semester, sections } = course;

      let url;
      if(instructor === 'all') {
        let [sem, year] = semester.split(' ');
        url = `http://localhost:8080/api/enrollment/aggregate/${courseID}/${sem.toLowerCase()}/${year}/`;
      } else {
        url = `http://localhost:8080/api/enrollment/data/${sections[0]}/`;
      }

      promises.push(axios.get(url));
    }

    axios.all(promises).then(data => {
      let enrollmentData = data.map((res, i) => {
        let enrollmentData = res.data;
        enrollmentData['id'] = classData[i].id;
        return enrollmentData
      })

      this.setState({
        enrollmentData: enrollmentData,
        graphData: this.buildGraphData(enrollmentData),
      })
    })
  }

  buildGraphData(enrollmentData) {
    let days = [...Array(200).keys()]
    const graphData = days.map(day => {
      let ret = {
        name: day,
      };

      for(let enrollment of enrollmentData) {
        let validTimes = enrollment.data.filter(time => time.day >= 0);
        let enrollmentTimes = {};
        for(let validTime of validTimes) {
          enrollmentTimes[validTime.day] = validTime;
        }

        if(day in enrollmentTimes) {
          ret[enrollment.id] = (enrollmentTimes[day].enrolled_percent * 100).toFixed(1);
        }
      }

      return ret;
    });

    return graphData;
  }


  update(course, day) {
    const { enrollmentData } = this.state;
    let selectedEnrollment= enrollmentData.filter(c => course.id == c.id)[0]

    let valid = selectedEnrollment.data.filter(d => d.day === day).length
    if(valid) {
      let hoverTotal = {
        ...course,
        ...selectedEnrollment,
        hoverDay: day,
      }

      this.setState({
        hoveredClass: hoverTotal,
      })
    }
  }

  // Handler function for updating EnrollmentInfoCard on hover
  updateLineHover(lineData) {
    const { classData } = this.props;
    const selectedClassID = lineData.dataKey;
    const day = lineData.index;
    let selectedCourse = classData.filter(course => selectedClassID == course.id)[0]
    this.update(selectedCourse, day);
  }

  // Handler function for updating EnrollmentInfoCard on hover with single course
  updateGraphHover(data) {
    let {isTooltipActive, activeLabel} = data;
    const { classData } = this.props;

    if(isTooltipActive && classData.length == 1) {
      let selectedCourse = classData[0];
      let day = activeLabel;
      this.update(selectedCourse, day);
    }
  }

  render () {
    let { graphData, enrollmentData, hoveredClass } = this.state;
    let telebears = enrollmentData.length ? enrollmentData[0]['telebears'] : {};

    var colorIndex = 0;
    for (var i = 0; i < enrollmentData.length; i++) {
      if (enrollmentData[i].id === hoveredClass.id) {
        colorIndex = i;
        break;
      }
    }
    let hoveredColor = vars.colors[colorIndex];

    return (
      <div className="card enrollment-graph-card">
        <div className="enrollment-graph">
          {
            enrollmentData.length === 0 ? (
              <GraphEmpty pageType='enrollment'/>
            ) : (
              <div className="enrollment-content">
                <Row>
                  <div className="graph-title">{ this.props.title }</div>
                </Row>
                <Row>
                  <Col sm={8}>
                    <EnrollmentGraph
                      graphData={graphData}
                      enrollmentData={enrollmentData}
                      updateLineHover={this.updateLineHover}
                      updateGraphHover={this.updateGraphHover}
                    />
                  </Col>

                  <Col sm={4}>
                    {hoveredClass &&
                      <EnrollmentInfoCard
                        title={hoveredClass.title}
                        subtitle={hoveredClass.subtitle}
                        semester={hoveredClass.semester}
                        instructor={hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor}
                        selectedPoint={hoveredClass.data.filter(pt => pt.day === hoveredClass.hoverDay)[0]}
                        todayPoint={hoveredClass.data[hoveredClass.data.length-1]}
                        telebears={telebears}
                        hoveredColor={hoveredColor}
                      />
                    }
                  </Col>
                </Row>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default EnrollmentGraphCard;
