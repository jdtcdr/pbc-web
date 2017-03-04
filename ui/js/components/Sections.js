import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Text from './Text';
import Image from './Image';
import CalendarSection from '../pages/calendar/CalendarSection';
import EventSection from '../pages/event/EventSection';
import LibrarySection from '../pages/library/LibrarySection';
import PagesSection from '../pages/page/PagesSection';
import PeopleSection from '../pages/user/PeopleSection';
import Video from './Video';
import FormSection from '../pages/form/FormSection';
import FilesSection from '../pages/file/FilesSection';
import Map from './Map';

export default class Sections extends Component {
  render() {
    const { align, sections } = this.props;
    const elements = sections.map((section) => {
      let contents;
      let backgroundImage = section.backgroundImage;
      if (section.type === 'text') {
        contents = <Text text={section.text} />;
      } else if (section.type === 'image') {
        contents = <Image image={section.image} />;
      } else if (section.type === 'calendar') {
        // exclude events already in sections
        const excludeEventIds =
          sections.filter(s => s.type === 'event')
          .map(s => s.eventId._id || s.eventId);
        contents = (
          <CalendarSection key={section._id || section.id}
            id={section.calendarId} excludeEventIds={excludeEventIds} />
        );
      } else if (section.type === 'event') {
        contents = (
          <EventSection id={section.eventId} includeMap={section.includeMap}
            navigable={section.navigable}
            includeBackground={section.backgroundImage === undefined} />
        );
        if (!backgroundImage) {
          backgroundImage = section.eventId.image;
        }
      } else if (section.type === 'library') {
        contents =
          <LibrarySection id={section._id} message={section.message} />;
      } else if (section.type === 'people') {
        contents = <PeopleSection people={section.people} />;
      } else if (section.type === 'pages') {
        contents = <PagesSection pages={section.pages} />;
      } else if (section.type === 'video') {
        contents = <Video url={section.url} />;
      } else if (section.type === 'form') {
        contents = <FormSection formTemplateId={section.formTemplateId} />;
      } else if (section.type === 'files') {
        contents = <FilesSection files={section.files} />;
      } else if (section.type === 'map') {
        contents = (
          <Map className="section" address={section.address} plain={true} />
        );
      } else {
        contents = <span>TBD</span>;
      }

      if (section.type !== 'calendar') {
        contents = (
          <Section key={section._id || section.id} align={align}
            full={section.full} color={section.color}
            backgroundImage={backgroundImage} plain={section.plain}>
            {contents}
          </Section>
        );
      }

      return contents;
    });
    return <div>{elements}</div>;
  }
}

Sections.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  sections: PropTypes.arrayOf(PropTypes.object),
};

Sections.defaultProps = {
  align: 'center',
  sections: [],
};