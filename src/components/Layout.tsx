import styled from "styled-components";

const LayoutBase = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <LayoutBase>{children}</LayoutBase>;
};
