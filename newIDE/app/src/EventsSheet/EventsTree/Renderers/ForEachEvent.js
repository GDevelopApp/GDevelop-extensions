// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList';
import VariableDeclarationsList from '../VariableDeclarationsList';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  executableEventContainer,
  instructionParameter,
  nameAndIconContainer,
  instructionInvalidParameter,
  eventLabel,
  disabledText,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import ObjectField from '../../ParameterFields/ObjectField';
import ExpressionField from '../../ParameterFields/ExpressionField';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { type ParameterFieldInterface } from '../../ParameterFields/ParameterFieldCommons';
import ParameterRenderingService from '../../ParameterRenderingService';
import { Trans } from '@lingui/macro';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  instructionsContainer: {
    display: 'flex',
  },
  actionsList: {
    flex: 1,
  },
  objectContainer: {
    marginLeft: '3px',
    marginRight: '2px',
  },
  orderContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  orderPopoverContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    minWidth: '300px',
  },
  orderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectStyle: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
  },
  labelStyle: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
};

export default class ForEachEvent extends React.Component<
  EventRendererProps,
  // $FlowFixMe[unsupported-syntax]
  *
> {
  _objectField: ?ParameterFieldInterface = null;
  _orderByField: ?ParameterFieldInterface = null;
  _limitField: ?ParameterFieldInterface = null;
  // $FlowFixMe[missing-local-annot]
  state = {
    editing: false,
    editingPreviousValue: null,
    anchorEl: null,
    editingOrder: false,
    editingOrderPreviousValues: null,
    orderAnchorEl: null,
  };

  edit = (domEvent: any) => {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    const objectName = forEachEvent.getObjectToPick();

    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editing: true,
            editingPreviousValue: objectName,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              if (this._objectField) this._objectField.focus();
            }, 10);
          }
        ),
      10
    );
  };

  cancelEditing = () => {
    this.endEditing();

    const forEachEvent = gd.asForEachEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue != null) {
      forEachEvent.setObjectToPick(editingPreviousValue);
      this.forceUpdate();
    }
  };

  endEditing = () => {
    const { anchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe[incompatible-type]
    if (anchorEl) anchorEl.focus();

    this.setState({
      editing: false,
      editingPreviousValue: null,
      anchorEl: null,
    });
  };

  editOrder = (domEvent: any) => {
    const forEachEvent = gd.asForEachEvent(this.props.event);

    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState({
          editingOrder: true,
          editingOrderPreviousValues: {
            // $FlowFixMe[method-unbinding]
            orderBy:
              typeof forEachEvent.getOrderBy === 'function'
                ? forEachEvent.getOrderBy()
                : '',
            // $FlowFixMe[method-unbinding]
            order:
              typeof forEachEvent.getOrder === 'function'
                ? forEachEvent.getOrder()
                : '',
            // $FlowFixMe[method-unbinding]
            limit:
              typeof forEachEvent.getLimit === 'function'
                ? forEachEvent.getLimit()
                : '',
          },
          orderAnchorEl: anchorEl,
        }),
      10
    );
  };

  cancelOrderEditing = () => {
    this.endOrderEditing();

    const forEachEvent = gd.asForEachEvent(this.props.event);
    const { editingOrderPreviousValues } = this.state;
    if (editingOrderPreviousValues != null) {
      // $FlowFixMe[method-unbinding]
      if (typeof forEachEvent.setOrderBy === 'function')
        forEachEvent.setOrderBy(editingOrderPreviousValues.orderBy);
      // $FlowFixMe[method-unbinding]
      if (typeof forEachEvent.setOrder === 'function')
        forEachEvent.setOrder(editingOrderPreviousValues.order);
      // $FlowFixMe[method-unbinding]
      if (typeof forEachEvent.setLimit === 'function')
        forEachEvent.setLimit(editingOrderPreviousValues.limit);
      this.forceUpdate();
    }
  };

  endOrderEditing = () => {
    const { orderAnchorEl } = this.state;
    // $FlowFixMe[incompatible-type]
    if (orderAnchorEl) orderAnchorEl.focus();

    this.setState({
      editingOrder: false,
      editingOrderPreviousValues: null,
      orderAnchorEl: null,
    });
  };

  render(): any {
    const forEachEvent = gd.asForEachEvent(this.props.event);
    const objectName = forEachEvent.getObjectToPick();
    // $FlowFixMe[method-unbinding]
    const orderBy =
      typeof forEachEvent.getOrderBy === 'function'
        ? forEachEvent.getOrderBy()
        : '';
    // $FlowFixMe[method-unbinding]
    const order =
      typeof forEachEvent.getOrder === 'function'
        ? forEachEvent.getOrder()
        : '';
    // $FlowFixMe[method-unbinding]
    const limit =
      typeof forEachEvent.getLimit === 'function'
        ? forEachEvent.getLimit()
        : '';
    const hasOrderBy = !!orderBy;

    const objectNameIsValid = this.props.projectScopedContainersAccessor
      .get()
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(objectName);

    const orderLabel = hasOrderBy
      ? `ordered by ${orderBy} ${
          order === 'desc' ? 'descending' : 'ascending'
        }${limit ? `, limit ${limit}` : ''}`
      : '(any order)';

    return (
      <div
        style={styles.container}
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
          [executableEventContainer]: true,
        })}
      >
        <VariableDeclarationsList
          variablesContainer={forEachEvent.getVariables()}
          loopIndexVariableName={forEachEvent.getLoopIndexVariableName()}
          onVariableDeclarationClick={this.props.onVariableDeclarationClick}
          onVariableDeclarationDoubleClick={
            this.props.onVariableDeclarationDoubleClick
          }
          className={'local-variables-container'}
          disabled={this.props.disabled}
          screenType={this.props.screenType}
          windowSize={this.props.windowSize}
          idPrefix={this.props.idPrefix}
        />
        <div className={eventLabel}>
          <Trans>
            Repeat for each instance of
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                object: true,
              })}
              style={styles.objectContainer}
              onClick={this.edit}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.edit(event);
                }
              }}
              tabIndex={0}
            >
              {objectName ? (
                <span>
                  {this.props.renderObjectThumbnail(objectName)}
                  {objectNameIsValid ? (
                    objectName
                  ) : (
                    <span
                      className={classNames({
                        [instructionInvalidParameter]: true,
                      })}
                    >
                      {objectName}
                    </span>
                  )}
                </span>
              ) : (
                <span className="instruction-missing-parameter">
                  <Trans>{`<Select an object>`}</Trans>
                </span>
              )}
            </span>
          </Trans>{' '}
          <span
            className={classNames({
              [selectableArea]: true,
              [instructionParameter]: true,
              [disabledText]: this.props.disabled,
            })}
            onClick={this.editOrder}
            onKeyPress={event => {
              if (shouldActivate(event)) {
                this.editOrder(event);
              }
            }}
            tabIndex={0}
          >
            {orderLabel}
          </span>
          :
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowSize={this.props.windowSize}
          eventsSheetWidth={this.props.eventsSheetWidth}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={forEachEvent.getConditions()}
              style={style}
              className={className}
              selection={this.props.selection}
              areConditions
              onAddNewInstruction={this.props.onAddNewInstruction}
              onPasteInstructions={this.props.onPasteInstructions}
              onMoveToInstruction={this.props.onMoveToInstruction}
              onMoveToInstructionsList={this.props.onMoveToInstructionsList}
              onInstructionClick={this.props.onInstructionClick}
              onInstructionDoubleClick={this.props.onInstructionDoubleClick}
              onInstructionContextMenu={this.props.onInstructionContextMenu}
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowSize={this.props.windowSize}
              scope={this.props.scope}
              resourcesManager={this.props.project.getResourcesManager()}
              globalObjectsContainer={this.props.globalObjectsContainer}
              objectsContainer={this.props.objectsContainer}
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
              idPrefix={this.props.idPrefix}
            />
          )}
          renderActionsList={({ className }) => (
            <InstructionsList
              platform={this.props.project.getCurrentPlatform()}
              instrsList={forEachEvent.getActions()}
              style={
                {
                  ...styles.actionsList,
                } /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
              }
              className={className}
              selection={this.props.selection}
              areConditions={false}
              onAddNewInstruction={this.props.onAddNewInstruction}
              onPasteInstructions={this.props.onPasteInstructions}
              onMoveToInstruction={this.props.onMoveToInstruction}
              onMoveToInstructionsList={this.props.onMoveToInstructionsList}
              onInstructionClick={this.props.onInstructionClick}
              onInstructionDoubleClick={this.props.onInstructionDoubleClick}
              onInstructionContextMenu={this.props.onInstructionContextMenu}
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowSize={this.props.windowSize}
              scope={this.props.scope}
              resourcesManager={this.props.project.getResourcesManager()}
              globalObjectsContainer={this.props.globalObjectsContainer}
              objectsContainer={this.props.objectsContainer}
              projectScopedContainersAccessor={
                this.props.projectScopedContainersAccessor
              }
              idPrefix={this.props.idPrefix}
            />
          )}
        />
        <InlinePopover
          open={this.state.editing}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.cancelEditing}
          onApply={this.endEditing}
        >
          <ObjectField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            projectScopedContainersAccessor={
              this.props.projectScopedContainersAccessor
            }
            value={objectName}
            onChange={text => {
              forEachEvent.setObjectToPick(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.cancelEditing}
            onApply={this.endEditing}
            ref={objectField => (this._objectField = objectField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingOrder}
          anchorEl={this.state.orderAnchorEl}
          onRequestClose={this.cancelOrderEditing}
          onApply={this.endOrderEditing}
        >
          <div style={styles.orderPopoverContent}>
            <div style={styles.orderRow}>
              <span style={styles.labelStyle}>
                <Trans>Order:</Trans>
              </span>
              <select
                style={styles.selectStyle}
                value={hasOrderBy ? 'ordered' : 'any'}
                onChange={e => {
                  if (e.target.value === 'any') {
                    forEachEvent.setOrderBy('');
                    forEachEvent.setOrder('');
                    forEachEvent.setLimit('');
                  } else {
                    forEachEvent.setOrder('asc');
                  }
                  this.props.onUpdate();
                  this.forceUpdate();
                }}
              >
                <option value="any">(any order)</option>
                <option value="ordered">ordered by...</option>
              </select>
            </div>
            {hasOrderBy || order !== '' ? (
              <React.Fragment>
                <div style={styles.orderRow}>
                  <span style={styles.labelStyle}>
                    <Trans>Order by expression:</Trans>
                  </span>
                  <ExpressionField
                    project={this.props.project}
                    scope={this.props.scope}
                    globalObjectsContainer={this.props.globalObjectsContainer}
                    objectsContainer={this.props.objectsContainer}
                    projectScopedContainersAccessor={
                      this.props.projectScopedContainersAccessor
                    }
                    value={orderBy}
                    onChange={text => {
                      forEachEvent.setOrderBy(text);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                    // $FlowFixMe[incompatible-type]
                    parameterRenderingService={ParameterRenderingService}
                    isInline
                    ref={field => (this._orderByField = field)}
                  />
                </div>
                <div style={styles.orderRow}>
                  <span style={styles.labelStyle}>
                    <Trans>Direction:</Trans>
                  </span>
                  <select
                    style={styles.selectStyle}
                    value={order === 'desc' ? 'desc' : 'asc'}
                    onChange={e => {
                      forEachEvent.setOrder(e.target.value);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div style={styles.orderRow}>
                  <span style={styles.labelStyle}>
                    <Trans>Limit (optional):</Trans>
                  </span>
                  <ExpressionField
                    project={this.props.project}
                    scope={this.props.scope}
                    globalObjectsContainer={this.props.globalObjectsContainer}
                    objectsContainer={this.props.objectsContainer}
                    projectScopedContainersAccessor={
                      this.props.projectScopedContainersAccessor
                    }
                    value={limit}
                    onChange={text => {
                      forEachEvent.setLimit(text);
                      this.props.onUpdate();
                      this.forceUpdate();
                    }}
                    // $FlowFixMe[incompatible-type]
                    parameterRenderingService={ParameterRenderingService}
                    isInline
                    ref={field => (this._limitField = field)}
                  />
                </div>
              </React.Fragment>
            ) : null}
          </div>
        </InlinePopover>
      </div>
    );
  }
}
