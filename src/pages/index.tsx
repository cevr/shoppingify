let Index = () => <></>;

export default Index;

export let getServerSideProps = () => ({
  redirect: {
    destination: "/items",
    permanent: true,
  },
});
