import {
  Button,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { SidebarWithHeader } from "../../../layouts/dashboard";

const Events = () => {
  return (
    <SidebarWithHeader title="イベント一覧">
      <TableContainer
        borderRadius="xl"
        border="1px"
        borderColor="chakra-border-color"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>日時</Th>
              <Th>イベント名</Th>
              <Th>担当</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td>millimetres (mm)</Td>
              <Td>
                <Button color="teal" as="a" href="#">
                  詳細
                </Button>
              </Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td>centimetres (cm)</Td>
              <Td>
                <Button color="teal" as="a" href="#">
                  詳細
                </Button>
              </Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td>metres (m)</Td>
              <Td>
                <Button color="teal" as="a" href="#">
                  詳細
                </Button>
              </Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>日時</Th>
              <Th>イベント名</Th>
              <Th>担当</Th>
              <Th></Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </SidebarWithHeader>
  );
};

export default Events;
