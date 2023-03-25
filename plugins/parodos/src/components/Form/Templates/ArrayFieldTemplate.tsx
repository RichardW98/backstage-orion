/* eslint-disable no-console */
import React, { useCallback, useState, type MouseEvent } from 'react';
import {
  getTemplate,
  getUiOptions,
  ArrayFieldTemplateProps,
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import {
  Button,
  makeStyles,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@material-ui/core';
import { assert } from 'assert-ts';
import { default as Form } from '@rjsf/core-v5';
import { useStyles as useFormStyles } from '../styles';

const useStyles = makeStyles(theme => ({
  stepper: {
    marginBottom: theme.spacing(2),
    background: theme.palette.background.default,
    '& div[class^="MuiPaper-root"]': {
      boxShadow: 'none',
      background: theme.palette.background.default,
      '& input': {
        background: theme.palette.background.paper,
      },
    },
  },
}));

/** The `ArrayFieldTemplate` component is the template used to render all items in an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export default function ArrayFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateProps<T, S, F>) {
  const {
    idSchema,
    uiSchema,
    items,
    registry,
    required,
    schema,
    title,
    formContext,
  } = props;
  const uiOptions = getUiOptions(uiSchema);

  const ArrayFieldTitleTemplate = getTemplate<
    'ArrayFieldTitleTemplate',
    T,
    S,
    F
  >('ArrayFieldTitleTemplate', registry, uiOptions);

  const ArrayFieldDescriptionTemplate = getTemplate<
    'ArrayFieldDescriptionTemplate',
    T,
    S,
    F
  >('ArrayFieldDescriptionTemplate', registry, uiOptions);

  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  );
  const [activeItem, setActiveItem] = useState(0);

  const form = formContext?.form?.current as Form;

  const handleNext = useCallback(
    (_e: MouseEvent) => {
      assert(!!form, 'no form in ArrayFieldTemplate');

      const isValid = form.validateForm();

      setTimeout(() => {
        if (!isValid) {
          if (activeItem !== items.length - 1) {
            setActiveItem(prev => prev + 1);
          }

          return;
        }

        // find the current array item index to see if we can progress or not
        const indexes = form.state.errors.map(error =>
          Number(error.property?.match(/(\d+)/g)?.[0]),
        );

        if (!indexes.includes(activeItem)) {
          setActiveItem(prev => prev + 1);
        }
      });
    },
    [activeItem, form, items.length],
  );

  const styles = useStyles();
  const formStyles = useFormStyles();

  return (
    <>
      <ArrayFieldTitleTemplate
        idSchema={idSchema}
        title={uiOptions.title || title}
        schema={schema}
        uiSchema={uiSchema}
        required={required}
        registry={registry}
      />
      <ArrayFieldDescriptionTemplate
        idSchema={idSchema}
        description={uiOptions.description || schema.description}
        schema={schema}
        uiSchema={uiSchema}
        registry={registry}
      />
      <Stepper
        activeStep={activeItem}
        orientation="vertical"
        className={styles.stepper}
      >
        {items &&
          items.map(
            (
              { key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>,
              index,
            ) => {
              return (
                <Step key={key}>
                  <StepLabel
                    StepIconProps={{ icon: String.fromCharCode(65 + index) }}
                    className={formStyles.stepLabel}
                  >
                    {uiOptions.title || itemProps.schema.title}
                  </StepLabel>
                  <StepContent key={key}>
                    <>
                      <ArrayFieldItemTemplate key={key} {...itemProps} />
                      <div>
                        <Button
                          disabled={activeItem === 0}
                          className={formStyles.previous}
                          onClick={() =>
                            setActiveItem(a => (activeItem === 0 ? 0 : a - 1))
                          }
                        >
                          PREVIOUS
                        </Button>
                        <Button
                          variant="contained"
                          type="button"
                          color="primary"
                          onClick={handleNext}
                          disabled={activeItem === items.length - 1}
                          className={formStyles.next}
                        >
                          NEXT
                        </Button>
                      </div>
                    </>
                  </StepContent>
                </Step>
              );
            },
          )}
      </Stepper>
    </>
  );
}
