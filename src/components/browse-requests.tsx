import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, X, Loader2, Truck } from "lucide-react";
import { transporterService } from "@/index";

export function TransporterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transporterService.getTransporterJobs();
      console.log(response.data);

      // Extract jobs from the response structure
      const jobsData = response.data?.jobs || response.data.data || [];
      setJobs(jobsData);
    } catch (err) {
      setError('Error fetching jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (shipmentId) => {
    try {
      setActionLoading(shipmentId);
      setError(null);

      const response = await transporterService.acceptJob(shipmentId);

      const isSuccess = response?.data;

      if (isSuccess) {
        console.log('Job accepted successfully');
        await fetchJobs();
      } else {
        setError('Failed to accept job');
      }
    } catch (err) {
      setError('Error accepting job: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineJob = async (shipmentId) => {
    try {
      setActionLoading(shipmentId);

      const response = await transporterService.declineJob(shipmentId);

      const isSuccess = response?.data;

      if (isSuccess) {
        console.log('Job declined successfully');
        await fetchJobs();
      } else {
        setError('Failed to decline job');
      }
    } catch (err) {
      setError('Error declining job: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // New function to handle starting pickup
  const handleStartPickup = async (shipmentId) => {
    try {
      setActionLoading(shipmentId);
      setError(null);

      // Call the service method to start pickup
      const response = await transporterService.startPickup(shipmentId);

      const isSuccess = response?.data;

      if (isSuccess) {
        console.log('Pickup started successfully');
        await fetchJobs(); // Refresh the jobs list
      } else {
        setError('Failed to start pickup');
      }
    } catch (err) {
      setError('Error starting pickup: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // New function to handle marking as delivered
  const handleMarkAsDelivered = async (shipmentId) => {
    try {
      setActionLoading(shipmentId);
      setError(null);

      // Call the service method to mark as delivered
      const response = await transporterService.markAsDelivered(shipmentId);

      const isSuccess = response?.data;

      if (isSuccess) {
        console.log('Job marked as delivered successfully');
        await fetchJobs(); // Refresh the jobs list
      } else {
        setError('Failed to mark as delivered');
      }
    } catch (err) {
      setError('Error marking as delivered: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not specified";
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'pickup_scheduled':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Jobs</CardTitle>
            <CardDescription>Manage your assigned shipment jobs.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading jobs...</span>
          </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Jobs</CardTitle>
            <CardDescription>Manage your assigned shipment jobs.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Jobs</CardTitle>
          <CardDescription>Manage your assigned shipment jobs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No jobs assigned at the moment.</p>
                <Button onClick={fetchJobs} variant="outline" className="mt-4">
                  Refresh
                </Button>
              </div>
          ) : (
              jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <CardTitle className="text-lg font-headline">
                        {job.itemDescription || "Shipment Job"}
                      </CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div>Tracking: {job.trackingNumber}</div>
                          <div>Customer: {job.customer?.user?.name || "Unknown"}</div>
                          <div>Phone: {job.customer?.user?.phone || "Not provided"}</div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">From:</span> {job.originAddress}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">To:</span> {job.destinationAddress}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Distance:</span> {job.distanceKm} km
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Weight:</span> {job.weight} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">Platform Fee:</span> KSh {parseFloat(job.platformFee || 0).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Status:</span>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                              {job.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Pickup Date:</span> {formatDate(job.pickupDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Estimated Delivery:</span> {formatDate(job.estimatedDeliveryDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Created:</span> {formatDate(job.createdAt)}
                        </p>
                      </div>

                      {job.specialInstructions && (
                          <div className="border-t pt-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">Special Instructions:</span> {job.specialInstructions}
                            </p>
                          </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      {/* Show accept/decline buttons for assigned jobs */}
                      {job.status?.toLowerCase() === 'assigned' && (
                          <>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                                onClick={() => handleDeclineJob(job.id)}
                                disabled={actionLoading === job.id}
                            >
                              {actionLoading === job.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <X className="mr-2 h-4 w-4" />
                              )}
                              Decline
                            </Button>
                            <Button
                                onClick={() => handleAcceptJob(job.id)}
                                disabled={actionLoading === job.id}
                            >
                              {actionLoading === job.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <Check className="mr-2 h-4 w-4" />
                              )}
                              Accept
                            </Button>
                          </>
                      )}

                      {/* Show start pickup button for pickup_scheduled jobs */}
                      {job.status?.toLowerCase() === 'pickup_scheduled' && (
                          <Button
                              onClick={() => handleStartPickup(job.id)}
                              disabled={actionLoading === job.id}
                              className="bg-blue-600 hover:bg-blue-700"
                          >
                            {actionLoading === job.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Truck className="mr-2 h-4 w-4" />
                            )}
                            Start Pickup
                          </Button>
                      )}

                      {/* Show mark as delivered button for in_transit jobs */}
                      {/*{job.status?.toLowerCase() === 'in_transit' && (*/}
                      {/*    <Button*/}
                      {/*        onClick={() => handleMarkAsDelivered(job.id)}*/}
                      {/*        disabled={actionLoading === job.id}*/}
                      {/*        className="bg-green-600 hover:bg-green-700"*/}
                      {/*    >*/}
                      {/*      {actionLoading === job.id ? (*/}
                      {/*          <Loader2 className="mr-2 h-4 w-4 animate-spin" />*/}
                      {/*      ) : (*/}
                      {/*          <Check className="mr-2 h-4 w-4" />*/}
                      {/*      )}*/}
                      {/*      Mark as Delivered*/}
                      {/*    </Button>*/}
                      {/*)}*/}

                      {job.status?.toLowerCase() === 'delivered' && (
                          <div className="text-green-600 text-sm font-medium">
                            ✓ Completed
                          </div>
                      )}
                    </CardFooter>
                  </Card>
              ))
          )}
        </CardContent>
      </Card>
  );
}