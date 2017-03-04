
import Add from '../../components/Add';
import EventFormContents from './EventFormContents';
import EventPreview from './EventPreview';

export default class EventAdd extends Add {}

EventAdd.defaultProps = {
  ...Add.defaultProps,
  category: 'events',
  FormContents: EventFormContents,
  Preview: EventPreview,
  showable: true,
  title: 'Add Event',
};
