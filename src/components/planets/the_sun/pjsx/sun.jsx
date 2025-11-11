import React from "react";
import {loaderGLTF} from '@react-three/drei';

export default function(sun){
    const{ scene }  = loaderGLTF("./src/components/planets/the_sun/scene.gltf")
}