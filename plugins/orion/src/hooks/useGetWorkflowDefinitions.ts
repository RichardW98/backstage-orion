import useAsync from 'react-use/lib/useAsync';
import { useBackendUrl } from '../components/api/useBackendUrl';
import { WorkflowDefinitionType } from '../components/types';
import { assert } from 'assert-ts';

export function useGetWorkflowDefinitions() {
  const backendUrl = useBackendUrl();

  return useAsync(async function getWorkflowDefinitions(): Promise<
    WorkflowDefinitionType[]
  > {
    const response = await fetch(
      `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
    );

    return (await response.json()) as WorkflowDefinitionType[];
  });
}

export function useGetWorkflowDefinition(workflowDefinitionType: string) {
  const result = useGetWorkflowDefinitions();

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const { value: allWorkflowDefinitions } = result;

  const workflowDefinition = allWorkflowDefinitions?.find(
    def => def.type === workflowDefinitionType,
  );

  assert(
    !!workflowDefinition,
    `no workflow definition for type ${workflowDefinitionType}`,
  );

  return { value: workflowDefinition, loading: false, error: null };
}
