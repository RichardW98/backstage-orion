import assert from 'assert-ts';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import * as urls from '../urls';
import { useStore } from '../stores/workflowStore/workflowStore';
import { getWorkflowsPayload } from './workflowsPayload';
import { useCallback } from 'react';
import { workflowExecute } from '../models/workflow';

export interface ExecuteWorkflow {
  projectId: string;
  formData?: Record<string, any>;
}

export function useExecuteWorkflow({
  workflowDefinitionName,
  assessmentWorkflowExecutionId,
}: {
  workflowDefinitionName: string;
  assessmentWorkflowExecutionId?: string;
}) {
  const { fetch } = useApi(fetchApiRef);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const workflow = useStore(state =>
    state.getWorkDefinitionBy('byName', workflowDefinitionName),
  );

  assert(
    !!workflow,
    `no assessmentWorkflow found for ${workflowDefinitionName}`,
  );

  return useCallback(
    async ({ projectId, formData = {} }: ExecuteWorkflow) => {
      const payload = getWorkflowsPayload({
        projectId,
        workflow,
        schema: formData,
      });
      // TODO:  task here should be dynamic based on assessment workflow definition
      const workFlowResponse = await fetch(workflowsUrl, {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          invokingExecutionId:
            workflow.type !== 'ASSESSMENT'
              ? assessmentWorkflowExecutionId
              : null,
        }),
      });

      if (!workFlowResponse.ok) {
        throw new Error(
          `${workFlowResponse.status} - ${workFlowResponse.statusText}`,
        );
      }

      return workflowExecute.parse(await workFlowResponse.json());
    },
    [workflow, fetch, workflowsUrl, assessmentWorkflowExecutionId],
  );
}
