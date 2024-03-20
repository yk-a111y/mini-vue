export function shouldComponentUpdate(preVNode, nextVNode) {
  const { props: prevProps } = preVNode;
  const { props: nextProps } = nextVNode;

  for (const key in prevProps) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
}