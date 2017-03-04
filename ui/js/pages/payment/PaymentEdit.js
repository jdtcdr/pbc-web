import Edit from '../../components/Edit';
import PaymentFormContents from './PaymentFormContents';

export default class PaymentEdit extends Edit {}

PaymentEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'payments',
  FormContents: PaymentFormContents,
  removeBackLevel: 1,
  title: 'Edit Payment',
};
