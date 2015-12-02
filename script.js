
var points = []; // Terminal and steiner coordinates
var D = 2;       // Dimensions
var N;           // Number of terminals
var edge = [];   // Two-dim array of ints (N+N-3 x 2) indicating vertex endpoints
var adj = [];    // Two-dim array of ints (N-2 x 3) indicating steiner point adjacencies
             
var treeLength;  // Total length of tree
var treeError;   // Error to the length
var EL;          // Two-dim array of doubles (edge lengths)
var B;           // Two-dim array of doubles (not sure what they represent)
var C;           // Two-dim array of doubles (not sure what they represent)
var eqnstack;    // Array of ints (not sure what they represent
var leafQ;       // Array of ints (not sure what they represent
var val;         // Array of ints (not sure what they represent

	
function initializeTerminals(sites){
  N = sites.length;

  // Ensure points has correct length and that first N entries are the sites
  while(points.length<N+N-2) points.push([Math.random(),Math.random()]);
  for(var i=0;i<N;i++)       points[i] = sites[i];

  while(edge.length<N+N-3)   edge.push([0,0]);
  while(adj.length<N-2)      adj.push([0,0,0]);

  // Reinitialize point placement datastructures with 0-entries
  EL = []; while(EL.length<N-2) EL.push([0,0,0]);
  B  = []; while( B.length<N)    B.push([0,0,0]);
  C  = []; while( C.length<N)    C.push([0,0]);
  eqnstack = []; while( eqnstack.length<N) eqnstack.push(0);
  leafQ    = []; while(    leafQ.length<N)    leafQ.push(0);
  val      = []; while(      val.length<N)      val.push(0);
  
}
	

/** Returns true when converged */
function updateSteinerPoints(tol){
  //Perturb steiner points
  //for(var i=N;i<2*N-2;i++)
  //  points[i][0]+=(Math.random()-0.5)*0.1;

  //Perform steiner points optimization
  //var q,r;
  //do{ 
  //  q = length(); 
  //  r = error();
  //  optimize(tol*r/N);
  //}while(r>tol*q);
  //return q;
  treeLength = length(); 
  treeError  = error();
  optimize(tol*treeError/N);
  return treeError<tol*treeLength;
}
	
function dist(p1, p2){
  var dx = p1[0]-p2[0];
  var dy = p1[1]-p2[1];
  return Math.sqrt(dx*dx+dy*dy);
}

/** Stores edge lengths of tree T in array EL[1..kl][0..2] and returns total length. */
function length(){

  var i2,i,j; 
  var n0,n1,n2; 
  var leng,t; 
  leng = 0.0;
  for(i=0; i<N_in-2; i++){
    i2 = i + N;
    n0 = adj[i][0]; n1 = adj[i][1]; n2 = adj[i][2]; 
    if(n0<i2){
      t = dist(points[n0],points[i2]);
      leng += t; EL[i][0] = t; n0 -= N;
      if(n0>=0) for(j=0; j<3; j++) if(adj[n0][j]==i2){ EL[n0][j] = t; break; } 
    }
    if(n1<i2){
      t = dist(points[n1],points[i2]);
      leng += t; EL[i][1] = t; n1 -= N;
      if(n1>=0) for(j=0; j<3; j++) if(adj[n1][j]==i2){ EL[n1][j] = t; break; }
    }
    if(n2<i2){
      t = dist(points[n2],points[i2]);
      leng += t; EL[i][2] = t; n2 -= N;
      if(n2>=0) for(j=0; j<3; j++) if(adj[n2][j]==i2){ EL[n2][j] = t; break; } 
    }
  }/* Have now figured out distance EL[i][0..2] from Steiner pt. i to neighbors. */
  return leng; 
}


/** Finds better coordinates XX[NUMSITES + 1..NUMSITES +kl][] for the kl Steiner points
 * of tree T by: doing a relaxation iteration. Assumes edge lengths of old tree
 * have been pre-stored in array EL[][] */
function optimize(tol){

  var i,m,j,i2; 
  var n0,n1,n2,lqp,eqp; 
  var q0,q1,q2,t;
  lqp = eqp = 0;

  // First: compute B array, C array, and valences. Set up leafQ. 
  for(i=N_in-3; i>=0; i--){
    n0 = adj[i][0]; n1 = adj[i][1]; n2 = adj[i][2];
    q0 = 1.0/(EL[i][0]+tol); 
    q1 = 1.0/(EL[i][1]+tol); 
    q2 = 1.0/(EL[i][2]+tol); 
    //Have now figured out reciprocal distances q0,q1,q2 from
    //Steiner pt. i to neighbors n0,n1,n2 
    t = q0+q1+q2; q0/=t; q1/=t; q2/=t;
    val[i] = 0; B[i][0] = B[i][1] = B[i][2] = 0.0;
    for(m=0; m<D; m++){ C[i][m] = 0.0; }
    if(n0>=N){ val[i]++; B[i][0] = q0; } else for(m=0; m<D; m++) C[i][m] += points[n0][m]*q0; //TODO: Optimize for D=2
    if(n1>=N){ val[i]++; B[i][1] = q1; } else for(m=0; m<D; m++) C[i][m] += points[n1][m]*q1;
    if(n2>=N){ val[i]++; B[i][2] = q2; } else for(m=0; m<D; m++) C[i][m] += points[n2][m]*q2;
    //Now: Steiner point i has Steiner valence val[i];
    //coords obey eqns XX[i+N][] = sum(j)of B[i][j]*XX[nj][] + C[i][] 
    if(val[i] <= 1){ leafQ[lqp] = i; lqp++; }/* put leafs on leafQ */ 
  }
  //Have set up equations - now-to solve them.
  //Second: eliminate leaves 
  while(lqp>1){
    lqp--; i = leafQ[lqp]; val[i]--; i2 = i+N;
    //Now to eliminate leaf i
    eqnstack[eqp] = i; eqp++; //Push i onto stack
    for(j=0; j<3; j++) if(B[i][j] != 0.0) break;// neighbor is 4+j 
    q0 = B[i][j];
    j = adj[i][j]-N;/* neighbor is j */
    val[j]--; if(val[j]==1){ leafQ[lqp] = j; lqp++; }/* new leaf? */
    for(m=0; m<3; m++) if(adj[j][m]==i2) break;
    q1 = B[j][m]; B[j][m] = 0.0;
    t = 1.0-q1*q0; t = 1.0/t;
    for(m=0; m<3; m++) B[j][m] *= t;
    for(m=0; m<D; m++){ C[j][m] += q1*C[i][m]; C[j][m] *= t; }
  }
  //Third: Solve 1-vertex tree!
  i = leafQ[0]; i2=i+N;
  for(m=0; m<D; m++) points[i2][m] = C[i][m]; 
  //Fourth: backsolve
  while(eqp>0){
    eqp--; i=eqnstack[eqp]; i2=i+N;
    for(j=0; j<3; j++) if(B[i][j] != 0.0) break; //neighbor is #j
    q0 = B[i][j];
    j = adj[i][j]; //Neighbor is j
    for(m = 0; m < D; m++ ) points[i2][m] = C[i][m] + q0*points[j][m];
  }

}

/** Returns the error figure of tree T with Steiner coords in XX[][].
 * Assumes edge lengths have been pre-stored in array EL[][]. */ 
function error(){
  var i,m,i2,n0,n1,n2; 
  var r,s,t,efig,d01,d12,d02; 
  efig=0.0;
  for(i=0; i<N_in-2; i++){
    i2 = i+N;
    n0 = adj[i][0]; n1 = adj[i][1]; n2 = adj[i][2];
    d12 = d01 = d02 = 0.0;
    for(m=0; m<D; m++){
      t = points[i2][m];
      r = points[n0][m]-t; s = points[n1][m]-t; t = points[n2][m]-t; 
      d12 += s*t; d01 += r*s; d02 += r*t;
    }
    // only angles < 120 cause error 
    t = d12 + d12 + EL[i][1]*EL[i][2]; if(t>0.0) efig += t; 
    t = d01 + d01 + EL[i][0]*EL[i][1]; if(t>0.0) efig += t; 
    t = d02 + d02 + EL[i][0]*EL[i][2]; if(t>0.0) efig += t;
  }
  efig = Math.sqrt(efig); 
  return efig;
}


function setKVector(kVec){

  N_in = kVec.length+3;
  var newSteiner = N;
  edge[0][0] = 0; edge[0][1] = newSteiner;
  edge[1][0] = 1; edge[1][1] = newSteiner;
  edge[2][0] = 2; edge[2][1] = newSteiner++;

  var e = 3;
  for(var i=0; i<kVec.length; i++){
      var s = kVec[i], v2 = edge[s][1]; //Split edge
      edge[e][0] = i+3;     edge[e++][1] = newSteiner;
      edge[e][0] = v2;      edge[e++][1] = newSteiner;
      edge[s][1] = newSteiner++;
  }

  var count = []; while(count.length<N-2) count.push(0); //Count is used to keep track of how full each separate Steiner-node adjacency entry is
  for(var i=0;i<e;i++){
    var s1 = edge[i][0]-N; if(s1>=0) adj[s1][count[s1]++] = edge[i][1];
    var s2 = edge[i][1]-N; if(s2>=0) adj[s2][count[s2]++] = edge[i][0];
  }


}


