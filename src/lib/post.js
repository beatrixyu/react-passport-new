
const POST = window.POST = async (path = "", data = {}) => {
  const opts = {
    method: "POST",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data)
  };
  if ( POST.token ) opts.headers["X-Auth-Header"] = POST.token;
  try {
    let result = await fetch(path, opts);
    return await result.json();
  } catch(e){
    return { success:false, message:e.toString() }
  }
};

export default POST;
