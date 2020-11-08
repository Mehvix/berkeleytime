import React from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import FilterCard from './FilterCard';

import { CourseOverviewFragment, CourseType, useGetCoursesForFilterQuery } from '../../graphql/graphql';
import { searchCourses, SearchableCourse } from 'utils/courses/search';
import { sortByAttribute, CourseSortAttribute } from 'utils/courses/sorting';

type FilterResultsProps = {
  activePlaylists: string[]
  selectCourse?: (course: CourseOverviewFragment) => void,
  selectedCourse: CourseOverviewFragment | null
  sortBy: CourseSortAttribute
  query: string
};

/**
 * Component for course list
 */
const FilterResults = ({
  activePlaylists,
  selectCourse,
  selectedCourse,
  sortBy,
  query: rawQuery
}: FilterResultsProps) => {

  const { data, loading } = useGetCoursesForFilterQuery({
    variables: {
      // playlists: activePlaylists
    }
  });


  let sortedCourses: CourseOverviewFragment[] = [];
  if (!loading) {
    const courses = data!.allCourses!.edges.map(edge => edge!.node!);

    // If we're using a "Relevance" search *and* there's a search query, we'll
    // use the search text-distance as the sorting metric.
    const hasQuery = rawQuery.trim() !== "";
    if (hasQuery) {
      // TODO: consider memoizing if this is slow.
      sortedCourses = searchCourses(courses, rawQuery);
    } else {
      sortedCourses = courses.sort(sortByAttribute(sortBy));
    }
  }

  const courseCardProps = {
    courses: sortedCourses,
    sortBy,
    selectCourse: selectCourse,
    selectedCourse
  };

  return (
    <div className="filter-results">
      {
        loading
          ? (
            <div className="filter-results-loading">
              <BeatLoader color="#579EFF" size={15} sizeUnit="px" />
            </div>
          )
          : (
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemData={courseCardProps}
                  itemCount={sortedCourses.length}
                  itemSize={110}
                  itemKey={(index) => sortedCourses[index].id}
                >
                  {FilterCard}
                </FixedSizeList>
              )}
            </AutoSizer>
          )
      }
    </div>
  );
}

export default FilterResults;
